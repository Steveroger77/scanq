import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import traceback

from agent import generate_pandas_code, generate_suggested_questions
from executor import execute_pandas_code

app = FastAPI(title="Scanq API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# In-memory storage for simplicity (1 user at a time for this MVP)
global_state = {
    "df": None,
    "filename": None
}

class QuestionRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global global_state
    
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        global_state["df"] = df
        global_state["filename"] = file.filename
        
        # Collect schema info
        rows, cols = df.shape
        columns_info = [{"name": col, "type": str(dtype)} for col, dtype in df.dtypes.items()]
        
        # Generate suggestions
        schema_str = "\n".join([f"{col}: {dtype}" for col, dtype in df.dtypes.items()])
        sample_rows_str = df.head(3).to_markdown()
        suggested_questions = generate_suggested_questions(schema_str, sample_rows_str)
        
        return {
            "filename": file.filename,
            "rows": rows,
            "columns": cols,
            "column_list": columns_info,
            "suggested_questions": suggested_questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    df = global_state.get("df")
    
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet")
        
    try:
        # Prepare schema and sample
        schema_str = "\n".join([f"{col}: {dtype}" for col, dtype in df.dtypes.items()])
        sample_rows_str = df.head(3).to_markdown()
        
        # 1. Generate code via OpenRouter
        response_json = generate_pandas_code(schema_str, sample_rows_str, req.question)
        python_code = response_json.get("python_code")
        
        if not python_code:
            raise ValueError("No python_code returned from LLM")
            
        # 2. Execute code securely (as requested)
        final_answer, result_table = execute_pandas_code(df, python_code)
        
        return {
            "answer": final_answer,
            "table": result_table
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

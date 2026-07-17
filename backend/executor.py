import builtins
import pandas as pd
import numpy as np

# Modules the LLM-generated code must never be allowed to import
_BLOCKED_MODULES = {
    "os", "sys", "subprocess", "shutil", "socket", "http",
    "urllib", "ftplib", "smtplib", "importlib", "ctypes",
    "multiprocessing", "threading", "pathlib", "glob",
    "tempfile", "signal", "pty",
}

def _restricted_import(name, *args, **kwargs):
    top_level = name.split(".")[0]
    if top_level in _BLOCKED_MODULES:
        raise ImportError("Import of '" + name + "' is not allowed in this environment.")
    return builtins.__import__(name, *args, **kwargs)

# Full builtins with only __import__ replaced by our restricted version
_SAFE_GLOBALS = vars(builtins).copy()
_SAFE_GLOBALS["__import__"] = _restricted_import

def execute_pandas_code(df: pd.DataFrame, code: str) -> tuple:
    """
    Executes LLM-generated pandas code with the provided dataframe `df`.
    Returns a tuple of (final_answer, result_table).
    """
    if not code or len(code) > 8000:
        return "Error: code is empty or too long.", None

    local_vars = {"df": df.copy(), "pd": pd, "np": np}

    try:
        exec(code, {"__builtins__": _SAFE_GLOBALS}, local_vars)

        final_answer = local_vars.get("final_answer")
        result_table = local_vars.get("result_table")

        # Convert final_answer to a native type if it's a pandas/numpy type
        if isinstance(final_answer, (pd.Series, pd.DataFrame)):
            final_answer = "Error: final_answer should be a single value, but got a Series/DataFrame."
        elif isinstance(final_answer, np.generic):
            final_answer = final_answer.item()

        # Convert result_table to a serializable dict format
        if isinstance(result_table, pd.DataFrame):
            result_table_dict = result_table.replace({np.nan: None}).to_dict(orient="records")
        elif isinstance(result_table, pd.Series):
            result_table_dict = result_table.replace({np.nan: None}).to_frame().to_dict(orient="records")
        else:
            result_table_dict = None

        return final_answer, result_table_dict

    except Exception as e:
        return "Error executing code: " + str(e), None

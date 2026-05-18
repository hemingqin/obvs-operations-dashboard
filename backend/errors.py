class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


def raise_api_error(status_code: int, code: str, message: str) -> None:
    raise ApiError(status_code=status_code, code=code, message=message)

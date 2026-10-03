export const apiResponse = <T>(data: T, message?: string, status = 200) => ({
  status,
  message,
  data,
});
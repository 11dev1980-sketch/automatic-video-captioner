export function logError(tag, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    tag,
    message,
    ...data,
  };
  console.error(JSON.stringify(logEntry));
}

export function logInfo(tag, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    tag,
    message,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}

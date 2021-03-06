export const fetchFromEndpoint = async endpoint => {
  const hhsPort = process.env.REACT_APP_HSS_PORT || 3002; 
  const response = await fetch(`http://localhost:${hhsPort}${endpoint}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  return response.json();
};

// --- fonction utilitaire ---
// Cette fonction envoie un log vers ton backend (Node.js)
// level = "LOG", "WARN" ou "ERROR"
// data = tableau contenant les arguments envoyés à console.log(...)
function sendLogToServer(level: string, data: any[]) {
  
  fetch("/api/log/front", {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
      level,
      message: data.map(String).join(" "),
      timestamp: new Date().toISOString() 
    })
  })
  .catch(() => {});
}


export function logIntoFile()
{
	console.log = (...args) => {
	  sendLogToServer("LOG", args);
	};
	
	
	console.error = (...args) => {
	  sendLogToServer("ERROR", args);
	};
}

const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const contactDir = "../../contacts/";
let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = "";
  let parsedUrl = url.parse(req.url, true);
  req.on("data", (chunk) => {
    store += chunk;
  });
  req.on("end", () => {
    if (req.method === "GET" && req.url === "/") {
      fs.createReadStream("../../index.html").pipe(res);
    } else if (req.method === "GET" && req.url === "/about") {
      fs.createReadStream("../../about.html").pipe(res);
    } else if (req.method === "GET" && req.url === "/contact") {
      fs.createReadStream("../../contact.html").pipe(res);
    } else if (req.method === "POST" && req.url === "/contact") {
      let username = qs.parse(store).username;
      fs.open(contactDir + username + ".json", "wx", (err, fd) => {
        if (err) {
          res.end(`username taken`);
          return console.log(err);
        }
        fs.writeFile(fd, JSON.stringify(qs.parse(store)), (err) => {
          if (err) return res.end(err);
          fs.close(fd, (err) => {
            if (err) return res.end(err);
            res.end(`${username} contacts saved`);
          });
        });
      });
    } else if (req.method === "GET" && parsedUrl.pathname === "/users") {
      let username = parsedUrl.query.username;
      fs.readFile(contactDir + username + ".json", (err, content) => {
        if (err) return res.end(err);
        let user = JSON.parse(content);
        res.setHeader("Content-Type", "text/html");
        res.write(`<p>Name - ${user.name}</p>`);
        res.write(`<p>Email - ${user.email}</p>`);
        res.write(`<p>Age - ${user.age}</p>`);
        res.write(`<p>Username - ${user.username}</p>`);
        res.write(`<p>About - ${user.about}</p>`);
        res.end();
      });
    } else if (req.method === "GET" && req.url.split(".").pop() === "css") {
      fs.createReadStream("../stylesheet/style.css").pipe(res);
    } else if (req.method === "GET" && req.url.split(".").pop() === "jpg") {
      fs.createReadStream(`../media/${req.url}`).pipe(res);
    }
  });
}

server.listen(5000, () => {
  console.log("server is listening on port 5k");
});

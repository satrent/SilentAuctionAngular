

This project has two parts, client and server.  

The client folder contains a simple web server to return the index.html. 
	from there, Angular controls everything.  Single page app.  


	to run the web server.
		-- make sure you have node installed.
		-- open terminal (command prompt on windows)
		-- get yourself to the client root directory.
		-- run npm install http-server -g
		-- run http-server
		-- you now have a simple http server running with the client folder as it's root. (congrats!)
		-- browse http://localhost:8080/index.html to test it out.



ok... now the server.  The server is a small group of node REST services to return and save data.

	to run the server.
		-- make sure you have node installed.
		-- open terminal (command prompt on windows)
		-- get yourself to the server root directory.
		-- run npm install to install the node dependencies
		-- run "node server.js" to start the server.
		-- browse http://localhost:8887/api/items to test (you should see a list of items)







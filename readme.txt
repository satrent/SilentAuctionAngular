

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

	get the database set up.  
		-- you'll need to have MySQL running locally on port 3306
		-- run the createdatabase.sql script in the root folder in MySQL Workbench

	to run the server.
		-- make sure you have node installed.
		-- open terminal (command prompt on windows)
		-- get yourself to the server root directory.
		-- run "npm install" to install the node dependencies
		-- run "node server.js" to start the server.







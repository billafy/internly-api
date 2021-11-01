# InternEvents 
	An Express based backend server for InternEvents

# Stucture
	/app contains all the functional code with the MVC structure
		server - the central server setup
		/controllers consists of the controller or view functions implementing the business logic
		/routers routes the requests mapped to the respective urls and forwards to the controller functions
		/schema has the database models specified
		/socket socket.io handler for realtime chats
		/utils
			auth - several authentication/authorization functions
			staticStorage - utility functions for media storage
			utils - miscellanous utility functions
			validators - functions to validate the incoming data
	/media stores all kinds of media items such as profile pictures, resumes, etc

	/controllers and /routers both are divided into 3 submodules :-
		1) accounts
		2) internships and events
		3) social (posts, user-to-user interactions, messaging)

# REST API
	Note : All the text based data is in JSON format and the files are passed as FormData

	Accounts

		GET /searchAccounts/:keyword
		Returns a list of accounts matching the keyword
		Response :
			Array(Account)

		POST /createStudentAccount
		Creates a student account and logs the user in
		Body :
			email, password, contactNumber, firstName,
			lastName, dateOfBirth, gender, college,
			course, yearOfStudying
			(Optional)
			description
		Cookie :
			accessToken
		Response :
			Object(Account)

		POST /createCollegeAccount
		Creates a college account and logs the user in
		Body :
			email, password, contactNumber,
			name, address, university
			(Optional)
			description
		Cookie :
			accessToken
		Response :
			Object(Account)

		POST /createCompanyAccount
		Creates a company account and logs the user in
		Body :
			email, password, contactNumber,
			name, address
			(Optional)
			description
		Cookie :
			accessToken
		Response :
			Object(Account)

		POST /login
		Logs the user in
		Body :
			email, password
		Cookie :
			accessToken
		Response :
			Object(Account)

		POST /refresh (AUTHORIZED)
		Checks for the access token and logs the user in
		Cookie :
			accessToken
		Response :
			Object(Account)

		POST /uploadResume/:id (AUTHORIZED)
		Uploads the resume for the specified account
		Body :
			resume(.pdf)
		Response :
			String(resumeUrl)

		POST /uploadProfilePicture (AUTHORIZED)
		Uploads the profile picture for the specified account
		Body :
			profilePicture(image)
		Response :
			String(profilePictureUrl)
 
		PUT /updateEmail/:_id (AUTHORIZED)
		Updates the email of the specified account
		Body :
			email
		Response :
			Object(Account)

		PUT /updatePassword/:_id (AUTHORIZED)
		Updates the password of the specified account
		Body :
			password
		Response :
			Object(Account)

		PUT /updateAccount/:_id (AUTHORIZED)
		Updates the non-credential details of the specified account
		Body :
			(Optional, may differ according to the account type)
			contactNumber, firstName, lastName, dateOfBirth,
			gender, college, course, yearOfStudying,
			name, address, university
		Response :
			Object(Account)

		DELETE /logout/:id (AUTHORIZED)
		logs the user out
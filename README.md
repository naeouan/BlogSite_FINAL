Project Overview: Briefly describe the purpose of the application. List the main features

This full-stack web application is a blog platform that allows users to create, read, update, and delete blog posts. It features user authentication, and a text editor.

- Create, edit, and delete blog posts
- text editor using React Quill
- frontend built with React
- Backend API with Node.js and Express
- MongoDB database integration




Technologies Used: List all technologies and tools used in the project:
- MongoDB
- Express.js
- React.js
- Node.js
- Mongoose
- JSON Web Tokens
- React Router DOM
- React Quill



Setup Instructions: Provide step-by-step instructions for setting up the project locally

Frontend Setup

cd client
npx create-react-app client
npm install react-router-dom
npm install react-quill

Backend Setup
cd api
npm install express
npm install cors
npm install mongoose
npm install jsonwebtoken


If react-quill is incompatible: Downgrade react to 18.2.0
npm install react@18.2.0 react-dom@18.2.0
If package gets corrupted, clean re-install

Folder Structure: Explain the folder structure of the project








Code Explanation: Break down the key parts of the code

api/…:

Index.js
- checks if a valid token is provided in the request cookies to check if user is authenticated.
- registers new user by saving their username and hashed password in the database
- route checks user credentials and, if correct, generates and sends JWT token back to the user
- route retrieves the logged-in user’s profile if they provide a valid token
- logs out user by clearing JWT token from the cookies
- route allows authenticated users to create a post, including uploading a file.
- allows an authenticated user to update an existing post (only if they are the author).
- retrieves a list of posts, sorted by creation date.
- allows the author of a post to delete their post.

client/…:
 CreatePost.js
Purpose: Create a new blog post.
Key parts:
useState manages title, summary, content, file, and redirect status.
Editor (custom component) used for rich text content.
createNewPost() handles form submission and sends data to the backend via POST /post.
If successful, redirects to the homepage using <Navigate />.


EditPost.js (Currently identical to CreatePost.js)
Fetch existing posts by ID.
Pre-fill fields with current data.
Submit changes using PUT or PATCH request.


 IndexPage.js
Purpose: Homepage that lists all blog posts.
Key parts:
useEffect() fetches all posts from GET /post.
Stores posts in useState.
Maps each post to a <Post /> component.


LoginPage.js
Purpose: Handles user login.
Key parts:
Collects username and password.
Sends POST /login with credentials.
If successful, stores user info and redirects.


PostPage.js
Purpose: View a single blog post in detail.
Key parts:
Uses useParams() to get post ID from URL.
Fetches post data from GET /post/:id.
Displays post content, image, and author.
If logged-in user is the author, shows an Edit button with link to /edit/:id.


RegisterPage.js
Purpose: Handles user registration.
Key parts:
Takes username and password.
Sends POST /register request.
Shows success/failure message based on response.


Post.js
Key Parts & Functionality
Imports
formatISO9075 – formats the createdAt date to readable format.
Link – allows navigation to other routes/pages without refreshing.
Function Post
Receives post data as props (_id, title, summary, cover, content, createdAt, author).
Image Section
Displays the cover image.
Wraps the image in a Link to the post’s detail page (/post/{id}).
Text Section
Shows the post title (also clickable using Link).
Displays the author’s username.
Shows the formatted date.
Displays the summary of the post.
Returns JSX
Combines image + text into a styled layout (.post, .image, .texts).








Challenges Faced: Describe any difficulties encountered during the project and how they were resolved

A few package incompatibility issues, we had to downgrade some but that also resulted in corrupting the package.json so we had to reinstall the packages clean. The guy teaching in youtube named Dawid was hard to follow, he switched files all of a sudden and I can barely understand his accent which made it time consuming. The tutorial was like the guy was just talking to himself which annoyed us a lot. His stupid accent is what really made it worse. It was like listening to gibberish, I couldn’t understand a word without captions.
Tutorial did not include delete post function so we had to make our own
client folder not getting pushed so we had to force commit and push it. We have tried everything ChatGPT said but it just resulted in losing our files by using the –rebase.
Had trouble deploying, followed the instructions but the backend didn’t run, also debugged on it for about 5 hrs on my routes of connecting backend and frontend on deployments.


Future Improvements:
- Account system improvements
- Design improvements 
- Logic improvements so that code is cleaner and there are a lot more functionalities
- A page for moderators to manage posts


Deployment Link

https://dota2blogsite-1.onrender.com
https://dota2-blog-site.vercel.app

Others: Include photos of you and/or you partner while doing your code

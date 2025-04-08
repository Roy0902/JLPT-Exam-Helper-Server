This is the source code of the server of the project CS4514 CS169 Mobile Japanese-Language Proficiency Test Helper.

======================================================================================================================
Author: Wan Chun Man (56231780)
Language: JavaScript, Python
IDR Environment: VS Code
Version: Node.js 22, Python 3.10
Deployment Environment: Google App Engine VM
======================================================================================================================
Installation
1. Install Node.js and Python
2. Open CMD
3. Navigate to the main folder of the server
4. Run the following command to install the dependency and package
- npm install
- pip install numpy, scikit-learn, pygad
5. Run the followng command to start the server:
- npm start app.js

***If you deploy the server in the local machine, please make the following change:
1. Go to ./service/study_plan_service
2. Press control+F and find '/app/venv/bin/python3'.
3. Replace all with 'python'
=======================================================================================================================
MySQL Create table records
The txt file 'mysql_create_table_records' have the records of the CREATE statement used to create table in the database.
=======================================================================================================================
Python file
The two python files in the folder are used to implement GA and CBF respectively.
=======================================================================================================================
Google Service Account Key
Because the key is revoked if it is published in the public repository, the keys in this repository are revoked and the services are not available if you deploy the server. If you want to get the keys, please contact me via chunmwan4-c@my.cityu.edu.hk.
=======================================================================================================================

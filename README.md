1. Install MariaDB
2. Create a database with any name
```
CREATE DATABASE <name>;
```
3. Create a .env file with the following content
```
DB_HOST=localhost
DB_NAME=
DB_PORT=
DB_USER=root
DB_PASSWORD=
OPENAI_API_KEY=
```
4. Install dependencies
```
npm install
```
5. Run the project
```
npm run dev
```
6. Scan the QR code with your phone
7. Insert into doctor table your data
```sql
INSERT INTO doctor (id_doctor, phone, first_name, last_name) VALUES (uuid(), '51{number} example 51999444222', 'name', 'lastname');
```
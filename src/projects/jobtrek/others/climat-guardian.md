# Climat Guardian <Badge type="tip" text="Others" />

## Context
By the end of the year, we were able to take some project for customers.
Most of my collegues worked on project for Jobtrek but Dylan an I got mendated by Mémoires Informatique to work on a project called Climat Guardian.

The project was about creating a web application to mesure the temperature and humidity in the different rooms.\
They allready had something working but it was a bit janky and they wanted to improve it.

## Technologies
They gave us 2 Raspberry Pi and 4 ESP32 to be able to test the application in our office.

We descided to use:
- a Raspberry Pi as a server
- the ESP32 to mesure the temperature and humidity
- esp-home to configure the ESP32
- PostgreSQL as a database
- postgrest as a REST API to interact with the database
- React for the front-end
- PhP for the auth back-end
- Docker to deploy the application

Some technology came later in the project:
- next.js to improve the front-end
- jwt for the authentification
- sqitch to make migrations of the database
- nginx to route the request to the right service
- adminer to look inside the database

Dylan worked on the front-end and I worked on the back-end, database, ESP32, deployment and the server.

## What I did

### Server
I started by the server as it was needed to be able to configure the ESP32.

The server being a Raspberry Pi, I installed imager on my computer to be able to install an OS on it, I chose Ubuntu Server as it was the only generic server OS I found on imager (except for Raspbian but I didn't wanted to use it).\
After installing the OS on the Raspberry, I asked my "teacher" if he could give me the IP of the Raspberry for me to connect through ssh.\
Once I was on the Raspberry, I installed docker and docker-compose to be able to deploy the application.

### Rest API
Once the server was up and running, I wanted to see how the API was working.\
I looked at the documentation of postgrest and say a tutorial section, I followed both tutorials and in the end I had a working API with jwt authentication.
![tutorials](../../../images/jobtrek/others/postgrest-tutorials.png)
Posgrest was really easy to use and once it was done I almost didn't had to change anything to make the tutorial application match our needs.

### Database

Once the API was working, I configured the database as Dylan needed to be able to query data from the database to make the front-end work.\
The first thing needed was the table that store the data from the ESP32 as it was what Dylan had to display on the front-end.
```sql
create table api.data (
    temperature real,
    humidity real,
    timestamp timestamp NOT NULL,
    ip character varying(15) NOT NULL
);
```

I then created a python script to create random data to insert into the database
```python
from random import randint
from datetime import datetime
 
current_temperature = 20
current_humidity = 50
 
winter_temperature = 10
winter_humidity = 40
summer_temperature = 30
summer_humidity = 60
 
def approch(current, target, variation_down, variation_up):
    diff = randint(int(100 * variation_down), int(100 * variation_up)) / 100 # we have a 2 decimal precision
    if current < target:
        current += diff
    else:
        current -= diff
    return current
 
print("insert into api.data (temperature, humidity, timestamp, ip) values")
for i in range(365):
    for j in range(4):
        current_temperature = approch(current_temperature, winter_temperature if i < 90 or i > 270 else summer_temperature, -1, 4)
        current_humidity = approch(current_humidity, winter_humidity if i < 90 or i > 270 else summer_humidity, -1, 4)
        date = datetime.strptime(f"2023-{i+1}-{j*6}", "%Y-%j-%H")
        print(f"\t({current_temperature:.2f}, {current_humidity:.2f}, '{date}', '127.0.0.1'){',' if i != 364 or j != 3 else ';'}")
```
I then started a database on the server and ran the result of this script in it for Dylan to have something to work with.

### ESP32
I then started configuring the ESP32 as I thought it would be easy and I could just reuse what they had.\
The ESP32 were configured using the esp-home website wich took some yaml configuration, compiled it and installed it on the ESP32.

The first problem I encountered was that I couldn't use esp-home to write the compiled code on the ESP32 if the ESP32 was connected to my computer through USB, I had to launch a docker on the server and connect the ESP32 to the server.\
Once I had written the code given by default by esp-home, I was able to unplugg the ESP32 and write the code through wifi wich was a lot more convenient.\
I therefore wrote the code that Mémoires Informatique was allready using as it was allready able to mesure the temperature and humidity and display it on the screen of the ESP32
```yml
esphome:
  name: mb-r-sensor-x-y
 
esp32:
  board: esp32dev
  framework:
    type: arduino
 
# Enable logging
logger:
#  level: VERBOSE
#  level: WARN
  level: ERROR
 
# Enable Home Assistant API
api:
 
ota:
  password: "f4f88acf9dd83f1113188ccdda6d6881"
 
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
 
  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: "test-sensor Fallback Hotspot"
    password: "Xet2vgoWpB9x"
 
captive_portal:
 
i2c:
  sda: 21
  scl: 22
  scan: true
  id: bus_a
 
sensor:
  - platform: aht10
    temperature:
      id: temperature
      name: "AHT10 Temperature"
    humidity:
      id: humidity
      name: "AHT10 Humidity"
    update_interval: 10s
  - platform: wifi_signal
    id: wifi_strength
    name: "WiFi Signal Sensor"
    update_interval: 10s
 
font:
  - file: 'Comic_Sans_MS.ttf'
    id: font1
    size: 16
  - file: 'Comic_Sans_MS.ttf'
    id: font2
    size: 8
 
graph:
  - id: temperature_graph
    sensor: temperature
    duration: 60min
    x_grid: 5min
    y_grid: 5.0 
    width: 151
    height: 51
  - id: humidity_graph
    sensor: humidity
    duration: 60min
    x_grid: 5min
    y_grid: 5.0
    width: 151
    height: 51
 
spi:
  clk_pin: 18
  mosi_pin: 23
 
time:
  - platform: sntp
    id: current_time
 
text_sensor:
  - platform: wifi_info
    ip_address:
      id: ip_address
      name: ESP IP Address
 
display:
  - platform: waveshare_epaper
    cs_pin: 5
    dc_pin: 17
    busy_pin: 4
    reset_pin: 16
    model: 2.13in-ttgo-dke
    full_update_every: 10
    update_interval: 10s
    rotation: 90
    lambda: |-
      it.printf(0, 25, id(font1), "%5.2f °C", id(temperature).state);
      it.graph(80, 10, id(temperature_graph));
      it.printf(0, 80, id(font1), "%5.2f %%", id(humidity).state);
      it.graph(80, 65, id(humidity_graph));
      it.strftime(133, 117, id(font2), "%d-%b-%Y %H:%M UTC", id(current_time).now());
      it.printf(6,117, id(font2), "%3.0f dBm - IP %s", id(wifi_strength).state, id(ip_address).state.c_str());
#      it.print(0, 0, id(font1), "Hello World!");
#      it.printf(0, 0, id(font1), "Temperature: %.1f°C, Humidity: %.1f%%", id(temperature).state, id(humidity).state);
```

I then ran into another problem, the configuration they had used custom fonts and esp-home didn't want to compile the code if I didn't have the fonts.\
I was able to find the fonts they were using pretty easily but I didn't knew where to put them. I tried putting them in some different directories that could make sense until I found the right one.\
The thing annoying was that I was doing this inside a docker and because I didn't knew docker that well, I had to rebuild the docker each time I changed the where the fonts were stored.

I then ran into another problem, the ESP32 was allready able to mesure the temperature and humidity but it was only displaying it on the screen of the ESP32 and I had no idea how to make any http request with the ESP32.\
I looked at their documentation but got lost in it, therefor I turned toward the developer's best friend: StackOverflow.\
I did some research before finding about the `http_request.post` key for the yaml configuration, however it was said it had to go after a `then` key and I had no idea what it was.\
I looked for something else but it seemed to be the only way to make an http request with the ESP32.

I saw that unlike the `display` property, the `http_request` didn't had an `update_interval` key I could use to seld the request regularly, therefor I started looking on how to periodically run code on the ESP32.\
After some research I found the `time` property wich I can use to run code every given amount of time.
```yml
time:
  - platform: sntp
    id: current_time
    on_time:
      - seconds: 10
        then:
```

Might look funny but after I found this, I had forgotten about the `http_request` key and I didn't knew what to do with the `then` key, I therefore had to look for it again.
```yml
time:
  - platform: sntp
    id: current_time
    on_time:
      - seconds: 10
        then:
          - http_request.post:
              url: !secret backend_url
```

However once I tested it, it didn't work and I had no idea why.\
It took me an awful amount of time to find out why it wasn't working, 
turns out not only I had to use the `http_request.post` key after a `then` key, but I also had to initialize the http client.
```yml
http_request:
  useragent: esphome/device
  id: http_request_data
  timeout: 10s
```

Once I was finally able to make http requests, I had to look at how to format the data into a json, I went back to the StackOverflow I found about the `http_request.post` key and found out that I could use the `json` key to format the data into a json directly under the `http_request.post` key.
```yml
time:
  - platform: sntp
    id: current_time
    on_time:
      - seconds: 10
        then:
          - http_request.post:
              url: !secret backend_url
              verify_ssl: false
              headers:
                Content-Type: application/json
              json: |-
                root["humidity"] = id(humidity).state;
                root["temperature"] = id(temperature).state;
                root["ip"] = id(ip_address).state;
                root["unix_timestamp"] = id(current_time).now().timestamp;
```

### Migration
Once the ESP32 were able to send data to the server, I realized that there was an incoherence between the way the ESP sent the time (unix timestamp) and the way PostgreSQL stored the time (timestamp).\
I tried to change the way the ESP sent the time but seeing the headache it allready gave me to make them do a request, I decided to make the changes in the database.\
However it's at that point that I realized that the database wan't frozen in time and if I changed the structure while the client was allready using it to store data, it would break the application.\
I asked my "teacher" about it and he recommended me to use sqitch to make migrations of the database as sqitch was runing bare SQL, meaning that it keeps every advantages of the SQL language we were using.\
Hopefully we had not sent the code to the client yet so breaking the database wasn't as much of a problem as it could have been.

I installed sqitch on the server and first didn't understood how it worked at all, I was manually creating files in the `deploy` directory and running `sqitch deploy` but it wasn't working.\
I then read the documentation a bit and found out I was supposed to create files using `sqitch add` and not manually, that way sqitch could index the files and know in which order to run them.\
Once I knew that I migrated the database in multiple files and told Dylan the golden rule about migrations: never change a migration file that has been deployed.

While making the migrations, I also implemented the modification needed to convert the unix timestamp into a timestamp
```sql
create or replace function api.insert_data(
    temperature real,
    humidity real,
    ip varchar(15),
    unix_timestamp bigint
) 
returns void as $$
begin
    insert into api.data("temperature", "humidity", "ip", "timestamp") values (temperature, humidity, ip, to_timestamp(unix_timestamp));
end $$ language plpgsql;
grant insert on api.data to esp32;
```

We also realized that giving all data to the front-end then averaging it wasn't the best way to do it and it would be better to average the data in the database and only give the average to the front-end.
```sql
create function api.avg_date(
    delta varchar
)
returns table(
    avg_temperature double precision, 
    avg_humidity double precision, 
    date timestamp,
    ip character varying(15),
    count bigint
) as $$
begin
    return query select 
    avg(temperature) as avg_temperature, 
    avg(humidity) as avg_humidity,
    date_trunc(delta, timestamp) as date,
    data.ip,
    count(*) as count
    from api.data
    group by date, data.ip
    order by date;
end;
$$ language plpgsql;
```

### Authentification
While the website was working fine, we didn't want anyone to be able to read the whole database or write anything in it.\
We decided to use jwt as authentication as it was natively implemented in postgrest and it was the only thing we had to secure.\
I created a table to store the user and their password
```sql
create table api.users (
    id serial primary key,
    username character varying(50) NOT NULL UNIQUE,
    password character varying(255) NOT NULL
);
```

I also created the postgresql roles and gave them the right permissions (for example users cannot write data while esp32 cannot read data)
```sql
-- anonymous role (no permission, given to anyone not logged in)
create role web_anon nologin;
grant usage on schema api to web_anon;
 
-- create role for the esp 32
create role esp32 nologin;
grant usage on schema api to esp32;
 
grant insert on api.data to esp32;
 
-- create role for the users
create role web_user nologin;
grant usage on schema api to web_user;
 
grant select on api.data to web_user;
grant usage, select on sequence api.users_id_seq to web_user; -- this is needed to be able to insert new users, otherwise they can't get an id
grant insert, delete, select on api.users to web_user; -- web_user can create/remove users as we need a way to create/remove users
 
-- create a role for the back-end
create role web_login nologin;
grant usage on schema api to web_login;
 
grant select on api.users to web_login; -- web_login needs to be able to get and modify users to know if they are authentified
```

I then created a php script to handle the authentification
- lib.php
```php
<?php
use JetBrains\PhpStorm\NoReturn;
#[NoReturn] function output(array $messages, int $code = 200): void {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode($messages);
    exit;
}
// I copy pasted this function from stackoverflow then modified it a bit to be more generic
function callAPI(string $method, string $url, array $data = [], array $headers = []): bool|string {
    $ch = curl_init();
 
    switch ($method) {
        case "POST":
            curl_setopt($ch, CURLOPT_POST, 1);
 
            if (!empty($data))
                curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($ch, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }
 
    // Optional Authentication:
    foreach ($headers as $value)
        curl_setopt($ch, CURLOPT_HTTPHEADER, array($value));
 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
 
    $result = curl_exec($ch);
 
    curl_close($ch);
 
    return $result;
}
```

- login.php
```php
<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../lib.php';
 
use Firebase\JWT\JWT;
use Symfony\Component\Dotenv\Dotenv;
 
if ($_SERVER['REQUEST_METHOD'] === 'POST')
    output(['error' => 'Unsupported method'], 405);
 
$data = json_decode(file_get_contents("php://input"), true);
 
if (!isset($data['username']) || !isset($data['password']))
    output(['error' => 'Username and password are required'], 400);
 
// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/../.env');
 
// Generate a token and use it to get the user, the token is valid for a tiny amount of time as we only use it once to get the user
$token = JWT::encode(['role' => 'web_login', 'exp' => time()], $_ENV['JWT_SECRET'], 'HS256');
$user = callAPI('GET', $_ENV['POSTGREST_API'] . "/users?username=eq.{$data['username']}&limit=1&select=password,id", [], ["Authorization: Bearer $token"]);
 
// Check if the answer is valid
if ($user === false)
    output(['error' => 
        $_ENV['DEBUG'] === 'true' ? 
            'Unable to connect to the API' :
            'Unknown error'
    ], 500);
$user = json_decode($user, true);
if (isset($user["message"]))
    output(['error' => 
        $_ENV['DEBUG'] === 'true' ? 
            $user :
            'Unknown error'
    ], 500);
if (empty($user))
    output(['error' => 'Unknown user'], 401);
if (!password_verify($data['password'], $user[0]['password']))
    output(['error' =>
        $_ENV['DEBUG'] === 'true' ?
            'Invalid password' :
            'Unknown user' // we don't want a hacker to know that they got the username right
    ], 401);
 
// Generate a token for the user that expires at midnight
$payload = [
    'role' => 'web_user',
    'id' => $user[0]['id'],
    'exp' => strtotime('tomorrow midnight')
];
$token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
 
output(['token' => $token]);
```

- register.php
```php
<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../lib.php';
 
use Firebase\JWT\JWT;
use Symfony\Component\Dotenv\Dotenv;
 
if ($_SERVER['REQUEST_METHOD'] === 'POST')
    output(['error' => 'Unsupported method'], 405);
 
$data = json_decode(file_get_contents("php://input"), true);
 
if (!isset($data['username']) || !isset($data['password']))
    output(['error' => 'Username and password are required'], 400);
 
// Register the user (we reuse the authentication header to register the user, that way we don't have to verify that the user is authentified (postgrest does it for us))
$response = callAPI(
    'POST',
    $_ENV['POSTGREST_API'] . '/users',
    ['username' => $data['username'], 'password' => password_hash($data['password'], PASSWORD_DEFAULT)],
    ["Authorization: " . getallheaders()['Authorization']]
);
 
if ($response === false)
    output(['error' => 
        $_ENV['DEBUG'] === 'true' ? 
            'Unable to connect to the API' :
            'Unknown error'
    ], 500);
$response = json_decode($response, true);
if (isset($response["message"]))
    output(['error' => 
        $_ENV['DEBUG'] === 'true' ? 
            $response :
            'Unknown error'
    ], 500);
 
output(['message' => 'User registered']);
```

- esp.php
```php
<?php
// This file is used to generate jwt tokens for the esp32
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../lib.php';
 
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Dotenv\Dotenv;
 
if ($_SERVER['REQUEST_METHOD'] === 'POST')
    output(['error' => 'Unsupported method'], 405);
 
$data = json_decode(file_get_contents("php://input"), true);
 
// check if the esp's ip is provided
if (!isset($data['ip']))
    output(['error' => 'IP is required'], 400);
 
// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/../.env');
 
// check if the user is authenticated
$user = getallheaders()['Authorization'];
if (!isset($user))
    output(['error' => 'Unauthorized'], 401);
$user = substr($user, 7); // remove the Bearer prefix
 
// test if the user is web_user
$decoded = JWT::decode($user, new Key($_ENV['JWT_SECRET'], 'HS256'));
if ($decoded->role !== 'web_user')
    output(['error' => 'Unauthorized'], 401);
 
// Generate a token for the esp
$token = JWT::encode(['role' => 'esp32', 'ip' => $data['ip']], $_ENV['JWT_SECRET'], 'HS256');
output(['token' => $token], 200);
```

At the beginning all these files were directly accessible called through the url as I didn't thought it made sense to have a router in these files,
however when my "teacher" saw that he told me that it was a bad idea as maybe one day in the future someone will find a way to modify the content of these files and made them return secrets,
therefor I added a router and hid these files in a folder that was not accessible from the outside.\
I still today don't see how it improves the security in any way ¯\\\_(ツ)\_/¯

### Routing
By now we started to have a lot of services running on the server, each one listening on a different port and it started being a bit unclear which url was for which service.\
Because of that we decided to add a program on the server that takes the request, parse the url and redirect it to the right service.\
At first we wanted to have an url like `api.climat-guardian.local` but although it was possible with nginx, it only worked when the url was exactly the one we set up and we would end up on a 404 page if we tried to access `api.127.0.0.1` for example.\
Because of that we decided to change the url to be `climat-guardian.local/api` even tho this reduced the amount of url available for the front-end (for example I set `/esp` to be esp-home but Dylan wanted to use `/esp` to be the front-end page with the map on wich we could see where the ESP32 were).
```nginx
server {
    # Logs
    rewrite_log on;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
 
    location /php/ {
        rewrite ^/php(.*)$ $1 break;
        root /var/www/memoires-info/php/public;
        fastcgi_pass php:9000;
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
 
    location /esp/ {
        rewrite ^/esp(.*)$ $1 break;
        add_header X-debug-message "uri: $uri" always;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://esphome:6052/;
 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
 
    location /adminer/ {
        rewrite ^/adminer(.*)$ $1 break;
        add_header X-debug-message "uri: $uri" always;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://adminer:8080/;
    }
 
    location /postgrest/ {
        rewrite ^/postgrest(.*)$ $1 break;
        add_header X-debug-message "uri: $uri" always;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://postg-rest:3000/;
    }
 
    location / {
        root /var/www/memoires-info/html;
        add_header X-debug-message "uri: $uri" always;
        try_files $uri $uri/ /index.html;
    }
}
```

### Deployment
#### Development

Because we had more and more programs running on the server, we had to launch each one of them manually each time we restarted the server 
(the server was stopped every night because we accidentally plugged it on a power outlet that was synchronized with the lights of the office).\
As it was starting to be a bit annoying, we decided to use a docker-compose file to launch everything at once inside containers.\
This was also a good way to make sure that nobody could access something they weren't supposed to access from outside the office (for example, no direct access to the database).
```yml
version: '3.9'
services:
 
  esphome:
    image: esphome/esphome:2024.4
    volumes:
      - ./esp32/config:/config
      - /etc/localtime:/etc/localtime:ro
      - /dev/ttyUSB0:/dev/ttyUSB0
    privileged: true
 
  db:
    image: postgres:16.3-alpine
    shm_size: 128mb
    volumes:
      - "./database/data:/var/lib/postgresql/data"
      - "./database/db.sql:/docker-entrypoint-initdb.d/db.sql"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example
      POSTGRES_DB: memoires-info
 
  adminer:
    image: adminer
    depends_on:
      - db
 
  postg-rest:
    image: postgrest/postgrest:v12.0.3
    environment:
      PGRST_JWT_SECRET: "XXXXXXXXXXXXXXXX"
      PGRST_DB_URI: "postgres://postgres:postgres@db:5432/memoires-info"
      PGRST_DB_ANO: role = "web_anon"
      PGRST_DB_SCHEMAS: "api"
      PGRST_OPENAPI_SERVE: proxy-uri = "http://0.0.0.0:3000"
    depends_on:
      - db
 
  web:
    image: nginx:1.26-alpine-otel
    ports:
      - '80:80'
    volumes:
      - ./Interface/dist:/var/www/memoires-info/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./login:/var/www/memoires-info/php
    depends_on:
      - postg-rest
      - adminer
      - esphome
```

Now some secrets were hardcoded in the docker-compose file, they were test secrets so no big deal but it would be nice to have a `.env` file to store them.\
I created a `.env.example` file with the keys and copied it to a `.env` file with the values.
I then added the `.env` file to the `.gitignore` file.\
I then had to change the docker-compose file to be able to use the values from the `.env` file `hard-coded-value` -> `${KEY_OF_THE_ENV_VALUE}`

You may have realized that I didn't put sqitch in the docker-compose file, that's because I didn't quite did it in the order I wrote it here, I just wanted to keep things organized here so added sqitch earlier here than I did in the project.\
However I ran into a problem when adding sqitch to the docker-compose file, while postgrest was able to connect to the database, sqitch wasn't.\
By looking at the logs I saw that sqitch was trying to connect the database when the database wasn't started, I found it weird as postgrest was able to connect to the database.
Still in the logs I saw that postgrest was retrying to connect to the database multiple times before the database was started.\
I then looked online as I was surely not the only one to have this problem and found out that people were setting a health check on the database to make sure that it was started, then setting the `depends_on` key to wait for it to be healthy
```yml
  db:
    image: postgres:16.3-alpine
    shm_size: 128mb
    volumes:
      - "./database/data:/var/lib/postgresql/data"
      - "./database/db.sql:/docker-entrypoint-initdb.d/db.sql"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example
      POSTGRES_DB: memoires-info
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d memoires-info"]
      interval: 10s
      timeout: 5s
      retries: 5
 
  migration:
    build:
      context: .
      dockerfile: Dockerfile.Sqitch
    image: sqitch-memoires-info
    environment:
      SQITCH_TARGET: "db:pg://postgres:${POSTGRES_PASSWORD}@db:5432/memoires-info"
    volumes:
      - "./database/migration:/repo"
    depends_on:
      db:
        condition: service_healthy
```

As you can see the `migration` service requires to build a docker image from a dockerfile that looks like this:
```dockerfile
FROM sqitch/sqitch:v1.4.1.0
CMD ["deploy"]
```

I also changed the `depend_on` for postgrest to wait for the database to be initialized before starting (migration done)
```yaml
  postg-rest:
    image: postgrest/postgrest:v12.0.3
    environment:
      PGRST_JWT_SECRET: "${JWT_SECRET}"
      PGRST_DB_URI: "postgres://postgres:${POSTGRES_PASSWORD}@db:5432/memoires-info"
      PGRST_DB_ANO: role = "web_anon"
      PGRST_DB_SCHEMAS: "api"
      PGRST_OPENAPI_SERVE: proxy-uri = "http://0.0.0.0:3000"
    depends_on:
      migration:
        condition: service_completed_successfully
```

#### Production

The development environment was working fine but it was heavy with stuff that wasn't needed in production (adminer), 
also every files created were stored on the computer even we didn't had to keep them.\
I created a docker-compose.prod.yml file that would be used for production and would allow as much things as the development one,
for example with the development one, every time you changed a file in the front-end, it was dynamically rebuilt and you could see the changes in real time, 
but on the production one, this was unnecessary so we could just pre-build the front-end and serve it statically.

Some of the services now needed to be build from a dockerfile, for example the ngnix one looked like this:
```dockerfile
# node 20, build the application
FROM node:20.12.2-alpine3.19
COPY ../nextjs-interface .
RUN npm install
RUN npm run build
 
# nginx 1.26 on port 80, keep the build output, nginx config
FROM nginx:1.26-alpine-otel
EXPOSE 80
COPY --from=0 ../out /var/www/memoires-info/html
COPY ../.env /var/www/memoires-info/html/.env
 
# copy the nginx config
COPY ../nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i '/location \/adminer\//,/}/d' /etc/nginx/conf.d/default.conf
```

Let me explain a bit what's happening here:
- we first build the front-end using a temporary image with node 20
- we create a new image with nginx 1.26 (alpine because it's lighter) and open the port 80 (http)
- we copy the output of the front-end build into the nginx image
- we copy the `.env` file and the `nginx.conf` files from our computer to the image
- we remove the part of the nginx config that was redirecting to adminer, adminer is not available in production therefor nginx would crash if we let it in the config

That way we only keep what's needed in production, we can then give the docker image to the client and it won't take as much disk space and resources


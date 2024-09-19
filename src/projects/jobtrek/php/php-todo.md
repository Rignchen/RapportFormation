# Blog <Badge type="tip" text="PhP" />

## Introduction
I didn't want to start this project as I had heard a lot of bad things about PHP, but once I started I realized that it was not as bad as I thought.\
We had to create a simple todo list using PHP, the todo list had to be a CRUD application:
- Create a task
- Read (Display) all tasks
- Update a task
- Delete a task

it also had to be able to search and sort task by name and to change their order.

## Starting the project
First, I started by creating a php file in which I would write the code for the todo list.\
I then created a json file to store the tasks.

In the php file, I start by reading the json file and decoding it to get the tasks:
```php
$tasks = json_decode(file_get_contents('tasks.json'), true);
```
Then I displayed them in a list:
```php
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <ul>
        <?php foreach ($tasks as $task): ?>
            <li><?= $task['name'] ?></li>
        <?php endforeach; ?>
    </ul>
</body>
```
I then created a form to add a task:
```html
<form method="post">
    <input type="text" name="name">
    <button type="submit" name="add">Add</button>
</form>
```
I then added the code to add the task to the json file:
```php
if (isset($_POST['add'])) {
    $tasks[] = ['name' => $_POST['name']];
    file_put_contents('tasks.json', json_encode($tasks));
}
```
But then I realized that when I refreshed the page, the task was added again, so I asked my "Teacher" for help and he told me that refreshing the page would send the form again, so I had to redirect the user to the same page after adding the task:
```php
header('Location: ' . $_SERVER["PHP_SELF"]);
```
I then added a button to delete a task:

```html
<button type="submit" name="removeTask">X</button>
<input type="hidden" name="task" value="<?= $key ?>">
```
And the code to remove the task:
```php
if (isset($_POST['removeTask'])) {
    unset($tasks[$_POST['task']]);
    file_put_contents('tasks.json', json_encode($tasks));
    header('Location: ' . $_SERVER["PHP_SELF"]);
}
```
I then realized that it was not very practical to have everything on the same page, so I moved the code to multiple files and required them in the main file. 

Once that was done I added the ability to update a task. This was a bit tricky as you can't update text in a html file,
so I decided to write the tasks inside an input field and change the value in the json file when the form is submitted.

I then added the ability to search tasks by name and to change their order, this wasn't too hard, I just made a loop that removes the task from the array
if their name doesn't contain the search query, I just had to be sure not to update the json file which I may have done by mistake at first.

Then to sort the tasks I used the `usort` function which sorts an array using a user-defined comparison function.

## 2nd version
Once this was done our "Teacher" asked us to change the way we stored the tasks and to use the session instead of a json file.\
I had to start the session at the beginning of the file, but then it was basically renaming the variables `$tasks` to `$_SESSION['tasks']`

Then once it was done I added an error message that shows above the list of tasks, I created the file `error.php` and required it in the main file, this file was pretty simple:
```php
<?php if (len($_SESSION["errors"]) > 0): ?>
    <div style="color:red;background-color:#ffcccc;border-radius:5px;padding:5px;">
        <?php foreach ($_SESSION["errors"] as $error): ?>
            <p>
                <?= $error ?>
            </p>
        <?php endforeach; ?>
    </div>
    <?php $_SESSION["errors"] = [];
endif; ?>
```
I then added a way to send an error message when the user tries to add a task with an empty name, 
the reason I used the session for this is that I had to redirect the user to the same page after trying to add a task which meant that variables would be reset.

## 3rd version
For the 3rd version, our "Teacher" asked us to use a sqlite database instead of the session as sessions are done with a cookie which can be reset by the browser and php can also remove them if they are old and take space on their servers.\
He showed us how to connect php storm to the database and explained how to use the `PDO` class to interact with the database.

This time it wasn't as easy as renaming the variables, I started by creating the database and the table:
```sql
create table if not exists `task` (
    `id` integer not null primary key autoincrement,
    `title` varchar(100) not null
);
```
Then I had to change a lot of the code:
- Adding a task was made by inserting the data in an array, I had to change it to a sql query: `insert into task (title) values (?)`
- Deleting a task was made by unsetting the task from the array, I had to change it to a sql query: `delete from task where id = ?`
- Updating a task was made by changing the value in the array, I had to change it to a sql query: `update task set title = ? where id = ?`
- Searching for a task was made by removing the task from the array if the name didn't contain the search query, I could have done the same but the sql query was more optimized, so I used it: `select * from task where title like ?`
- Sorting the tasks was made by using the `usort` function, I could have done the same but the sql query was more optimized, so I used it: `select * from task order by title`
- Changing the order of the tasks was made by changing the title of one task with the title of the other, it's still the same but with a sql query

To make my life easier I made a function that made the sql queries for me:
```php
function update_tasks_in_db($contents): void {
    global $pdo;
    foreach ($contents as $data) {
        $sql = $pdo->prepare("UPDATE `task` SET title = :title WHERE id = :id");
        $sql->execute($data);
    }
}
```
That way all I had to keep track of was keeping an array of the tasks to update and then call the function right before reloading the page.\
That been said, the error message was still done with the session as I emptied the session after displaying the error message anyway.

# Rust todo list <Badge type="tip" text="Rust" />

Once we've were used to Rust, our "teacher" gave us the instruction of creating a [todo list](https://github.com/Rignchen/todo_rust) using the rust language.

### Main loop
I started by creating an endless loop that would ask the user for input
```rust
fn main() {
	let mut running: bool = true;
	
	// main loop
	while running {
		inpu = input("input:").to_lowercase();
	}
}
```

### Exit
I then quickly added a way to exit the program as I didn't want to have to force close it every time
```rust
		match inp {
			"e"|"esc"|"exit"|"quit" => {
				let temp = input("Are you sure you want to leave? All unsaved modification will be lost [y/n]").to_lowercase();
				if temp == "y" || temp == "yes" {*_run = false}
			},
```

### Add and remove items
I then added a way to add and remove items to the list
```rust
	let todos: Vec<String> = vec![];
	let archive: Vec<String> = vec![];

			"n"|"new" => {
				let temp = input("What's task do you want to add?");
				if temp.trim() != "" {todos.push(temp.trim().to_string())};
				show_values(&todos, 5);
			},
			_ => {
				match inp.parse::<usize>() {
					Ok(parsed_value) => {
						if parsed_value < todos.len() {archive.push(todos.remove(parsed_value))}
						else {println!("No task with id {} found",parsed_value)}
					}
					Err(_) => {
						println!("Invalid input")}
					}
				}
```
![add new task](../../images/rust_todo/new_task.png)<br>

### Show the list
I then had to add a way to show the list, I wanted it to hapend automatically when the program started and when the user asked for it, so I did it in a function
```rust
    show_values(&todos, 5)

fn show_values(list: &[String], mut amount: usize) {
	if amount > list.len() {amount = list.len()}
	if amount > 0 {
		for i in 0..amount {
			println!("{}. {:?}",i, list[i])
		}
		return true;
	}
	println!("The list is empty");
}
```
![show todo list](../../images/rust_todo/show_list.png)<br>

### Re-run the last command
At this point I realized that I wanted the user to be able to easily re-run the last command without having to type it again,
so I added a way to store temporary the last command run. I then set it so the user could rerun it by pressing enter without typing anything
```rust
	let mut last_inp: String = "".to_string();
    
        if command(inp, &mut running, &mut todos, &mut archive) {
			last_inp = inp.to_string()
		} // commands -> store in "last_command"
		else {																									 // commands -> not store in "last_command"
			match inp {
				""|"last" => {command(last_inp.as_str(), &mut running, &mut todos, &mut archive);},
				"q"|"quick_start"|"quickstart"|"quick start"|"restart"|"reset" => start(&todos),
				_ => {
					match inp.parse::<usize>() {
						Ok(parsed_value) => {
							if parsed_value < todos.len() {archive.push(todos.remove(parsed_value))}
							else {println!("No task with id {} found",parsed_value)}
						}
						Err(_) => {
							println!("Unknow command \"{}\"",inp);
						}
					}
				}
			}
		}
```
![re-run last command](../../images/rust_todo/rerun_command.png)<br>

### Other commands
I then added multiple commands I wanted to have in the program, for example I added a `help` command wich list all the commands available
![help command](../../images/rust_todo/help.png)<br>

### Save and load
Once this was done, I added a way to save the list to a file and load it back when the program starts<br>
I decided to use a markdown file to store this list as it's easily readable by humans without the need of my program<br>
```md
- [ ] format size 1440 x 900 px
- [ ] Change titles
- [ ] Finish the css for the index
- [X] Finish the css fot the menu
- [X] Finish the css for the about us
- [X] redrow the title
- [X] Finish the css for the making off
```
In markdown, a line starting with `- [ ]` is an unchecked checkbox and `- [X]` is a checked checkbox<br>

<input type="checkbox" disabled> format size 1440 x 900 px<br>
<input type="checkbox" disabled> Change titles<br>
<input type="checkbox" disabled> Finish the css for the index<br>
<input type="checkbox" checked disabled> Finish the css fot the menu<br>
<input type="checkbox" checked disabled> Finish the css for the about us<br>
<input type="checkbox" checked disabled> redrow the title<br>
<input type="checkbox" checked disabled> Finish the css for the making off<br>

### End
After that the program was done, so I sent it to my teacher.<br>
Obviously, the program was far from perfect and the code was pretty messy, but I think it was pretty good for a first project

# Solution Wiper <Badge type="tip" text="Rust" />

## Context
At some point while working on [climat-guardian](../others/climat-guardian "The page where I talk about it"), my colleague who was working on the front-end had to restart all from scratch because the codebase was too messy. Even though another colleague joined him at that point, I still was way ahead of them and I had to wait for them to catch up.

At that point, my "teacher" came to me and asked me to help him write some exercices to help the future apprentices learn Rust. After I've done so he said that it was a bit annoying to have to manually delete the solutions from the exercices, so he asked me to write a program that would do it for him.

## Goal
The goal of this program was to remove all solutions from the exercices we wrote, another important point was that the program had to be able to be run from a github action so we could automate the process.

The code looks like this:
````rust
/// Adds one to the absolute value of the input.
/// ```
/// use ex_rust::example::add_one;
/// assert_eq!(add_one(2), 3);
/// assert_eq!(add_one(-1), -2);
/// ```
pub fn add_one(n: i32) -> i32 {
    // Write your code here
    if n < 0 {
        n - 1
    } else {
        n + 1
    }
}
````

and we wanted to have it look like this once the program was run:
````rust
/// Adds one to the absolute value of the input.
/// ```
/// use ex_rust::example::add_one;
/// assert_eq!(add_one(2), 3);
/// assert_eq!(add_one(-1), -2);
/// ```
pub fn add_one(n: i32) -> i32 {
    // Write your code here
    todo!()
}
````

Basically, we wanted to replace everything between the `// Write your code here` comment and the end of the function by a `todo!()` macro.

## Naming the program
Like allways the hardest part of the program was to find a name for it.\
We spend almost an entire day trying to find a cool name for it, in the end my "teacher" chose the name "[Solution Wiper](https://github.com/jobtrek/sw "github")" and I had to stick with it even though it was definitly not my favorite name.

## Detecting the solution
I didn't want to have to parse the code to find the place where the solution was, therefore I looked on the internet and found a program called `ast-grep` that tokenized the code and gave you a json telling you the position where your selection starts and ends.

Ast-grep needed a yaml configuration file containing the rule we want to use to select the code, so I wrote this one:
```yaml
id: my-rule
language: rust
rule:
  any:
    - kind: block
    - kind: field_declaration_list
  pattern: $BLOCK
  has:
    pattern: $COMMENT
    all:
      - any:
        - kind: line_comment
        - kind: block_comment
      - any:
        - regex: "Write your code here"
        - regex: "Write your logic here"
```

Let me explain this configuration file:
- `id`: the id of the rule, it's mendatory but not really useful for us
- `language`: the language of the code we want to parse, for now it was only Rust
- the `rule` field describes our rule
  - `any`: mean that our rule can be from any of these things but not from somewhere else, here we test the kind of code we are looking for
    - `block`: a block of code starting with `{` and ending with `}`
    - `field_declaration_list`: it's like a block but for type declaration (struct, enum, ...)
  - I then name the block we were in `$BLOCK`, this information can then be found in the json output of ast-grep
  - I then look inside our selection for a comment wich can be either a single line or a multiline one, that was either "Write your code here" or "Write your logic here" (We weren't supper consistent in our exercices)
  - I named this comment `$COMMENT`

Once ast-grep was run on this configuration file, it gave us one of the uggliest json I know but it had all the information we needed to detect where the solution was so I didn't complain... at least not too much.\
For example with the example we have above it gives us this ginormous thing
```json
[
  {
    "text": "{\n    // Write your code here\n    if n < 0 {\n        n - 1\n    } else {\n        n + 1\n    }\n}",
    "range": {
      "byteOffset": {
        "start": 194,
        "end": 287
      },
      "start": {
        "line": 6,
        "column": 30
      },
      "end": {
        "line": 13,
        "column": 1
      }
    },
    "file": "toto.rs",
    "lines": "pub fn add_one(n: i32) -> i32 {\n    // Write your code here\n    if n < 0 {\n        n - 1\n    } else {\n        n + 1\n    }\n}",
    "charCount": {
      "leading": 30,
      "trailing": 0
    },
    "language": "Rust",
    "metaVariables": {
      "single": {
        "COMMENT": {
          "text": "// Write your code here",
          "range": {
            "byteOffset": {
              "start": 200,
              "end": 223
            },
            "start": {
              "line": 7,
              "column": 4
            },
            "end": {
              "line": 7,
              "column": 27
            }
          }
        },
        "BLOCK": {
          "text": "{\n    // Write your code here\n    if n < 0 {\n        n - 1\n    } else {\n        n + 1\n    }\n}",
          "range": {
            "byteOffset": {
              "start": 194,
              "end": 287
            },
            "start": {
              "line": 6,
              "column": 30
            },
            "end": {
              "line": 13,
              "column": 1
            }
          }
        }
      },
      "multi": {
        "secondary": [
          {
            "text": "// Write your code here",
            "range": {
              "byteOffset": {
                "start": 200,
                "end": 223
              },
              "start": {
                "line": 7,
                "column": 4
              },
              "end": {
                "line": 7,
                "column": 27
              }
            }
          }
        ]
      },
      "transformed": {}
    },
    "ruleId": "my-rule",
    "severity": "hint",
    "note": null,
    "message": "",
    "labels": [
      {
        "text": "// Write your code here",
        "range": {
          "byteOffset": {
            "start": 200,
            "end": 223
          },
          "start": {
            "line": 7,
            "column": 4
          },
          "end": {
            "line": 7,
            "column": 27
          }
        }
      }
    ]
  }
]
```

From this json we wanted to extract end of our comment and the end of our block as those delemeted the part we wanted to remove.\
We also wanted to extract the column of the beginning of our comment as this is our indentation level.

## Getting the solution in our rust code
If we look at the json we can see that
- our comment's position is located in `meta_variables.single.COMMENT.range`
- our block's position is located in `range`

I used serde to parse the json and extract the information I needed inside a structure.\
However making multiple structures for each field was a bit annoying so I used a macro from a library called `structstuck` to generate the structures for me.\
This macro allowed me to write structure definitions inside another structure definition
```rust
structstruck::strike! {
    /// structure of the json returned by ast-grep (only the useful parts)
    #[strikethrough[derive(Serialize, Deserialize, Debug)]]
    struct Program {
        range: struct {
            start: struct {
                line: u16,
                column: u16,
            },
            end: struct {
                line: u16,
                column: u16,
            }
        },
        #[serde(rename = "metaVariables")]
        meta_variables: struct {
            single: struct {
                #[serde(rename = "COMMENT")]
                comment: struct {
                    // here we can directly refer to the range struct as we allready defined it
                    range: Range
                }
            }
        }
    }
}
```

```rust
fn main() {
    let parsed = unwrap_sw_error(get_removable_parts());
    println!("{:?}", parsed);
}

fn get_removable_parts(extension: &str, file: &str) -> Result<Vec<Program>, SwError> {
    match serde_json::from_str(&run_command(&format!(
        "ast-grep scan --rule /etc/jobtrek/sw/ast-grep-rules/{}.yaml {} --json",
        extension, file
    ))?) {
        Ok(x) => Ok(x),
        Err(e) => Err(SwError::AstGrepParseError(e)),
    }
}
```

## Getting all the files with rust code
We wanted to be able to run the program on a folder to remove the solutions from all the files in it.\
We decided to use a program called `fd` to get all the files with the `.rs` extension in the folder and its subfolders.
```rust
pub fn get_files_per_extension(
    path: &str,
    extension: &str,
) -> Result<Vec<String>, SwError> {
    if std::fs::metadata(path)?.is_dir() {
        return Ok(run_command(&format!(
            "fd . {} -e {} --type f",
            path,
            extension
        ))?
           .split('\n')
           .filter(|&x| !x.is_empty())
           .map(|x| x.to_string())
           .collect::<Vec<String>>());
    }
    if !path.ends_with(format!(".{}", extension).as_str()) {
        return Ok(vec![]);
    }
    Ok(vec![path.to_string()])
}


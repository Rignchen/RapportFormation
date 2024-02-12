# Grade Calculator <Badge type="tip" text="Javascript" />

Once we knew how to use the DOM, we started to build a grade calculator. The idea was to only make the javascript part of the project, so our "teacher" gave us the html css for the webpage.
![Html and css](../../images/grade-calculator/html-css.png)

I started by implementing a function to add the grade elements in the semesters, I then made added a function to add new semesters and realised I had to code the function to add the grades in the semesters again because the semesters were now generated instead of being hardcoded.

Once this was done I calculated the average grade of the semesters, then I coded a calculated the average of the subjects.
I used the querySelector to get the list of the grades not to have to store them in variables.

Once this was done I implemented the ability to change subjects. Because I didn't want to make to code the same page again and again, I just empty the content of every semester and changed a variable to know which the current subject.

I then copied the subject average of the subject on the left of the page and calculated the difference old and the new average.\
I then calculated the global average of all subjects

Once this was done, I started all over again but this time using Angular. At first, I thought I could just copy past my javascript code in the typescript files, and it would work, but I was wrong, when I did it, webstorm told me "this variable can be of type ___ and this is not assignable to type ___" every 2 lines.\
I then started to watch a tutorial on how to use Angular, I chose a recent one 'cause I knew Angular had changed a lot since it came out.\
The problem was that guy who made the tutorial didn't know how to use Angular, and he was explaining it wrong way to do things which made me lose a lot of time.\
Hopefully, my "teacher" saw what I was doing and told me that it was garbage, he then showed me how to use Angular, and I started all over again.\

I then created a list of list of integers to store the grades, the idea was that each of these lists would be a semester, I then created a semester component and made it so that it would herit of the list of integers.\
I then created a grade component and made it so that it would herit of a number and display it.\
I then made it so that the semester component would display the grades and calculate the average of the grades.
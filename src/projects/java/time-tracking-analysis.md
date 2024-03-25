# Time Tracking Analysis <Badge type="tip" text="Java" />

Before the Christmas break, our "teacher" exported our time tracking data in a CSV file and asked us to analyze it.\
The goal was to use the language we wanted to analyze the data and output these information:
- Total time spent
- The difference between the time spent and the time we should have spent
- The time spent on the different projects
- The time spent using the different programming languages
- The time spent in school
- The time spent sick
- The time spent on vacation
- The amount of time we were late
- The average time spent in coaching
- The price we cost to the society on the different projects

He also told us that we were allowed to leave once we had finished so that people would try to finish as quickly as possible.\
I decided to use Java because I wanted to use the Streams to manipulate the data.

## Read the CSV file
I started by reading the CSV file, I remembered that I had already done this when we were learning java, so I went back to the code I had written and copied the function to read the CSV file.
```java
/**
 * @param path Path of the csv file to read
 * @param separator Character used to separate values on a line
 * @return Content of the csv, split per lines, each line split on the separator
 */
public static List<String[]> readCSV(String path, Character separator) throws IOException {
    return readFile(path).stream()
            .map(s -> s.split(separator.toString()))
            .toList();
}

/**
 * @param path Path of the csv file to read
 * @return Content of the csv, split per lines, each line split on the comas
 */
public static List<String[]> readCSV(String path) throws IOException {
    return readCSV(path, ',');
}
```
## Represent the data
Once I had the data in a list of String arrays, I decided to create a class to represent the data, that way I could use the column names to access the data instead of using the index of the column.
```java
public class Main {
    public static void main(String[] args) {
        ArrayList<JtTime> timeList = new ArrayList<JtTime>();
        lib.readCSV("data/Nils_Hofstetter.csv").forEach(line -> timeList.add(JtTime.fromList(line)));
    }
}

public class JtTime {
    String Date;
    String Start;
    Integer Duration;
    String Project;
    String Activity;

    public JtTime(String Date, String From, String Duration, String Project, String Activity) {
        this.Date = Date;
        this.Start = From;
        this.Duration = Integer.valueOf(Duration);
        this.Project = Project;
        this.Activity = Activity;
    }
    public static JtTime fromList(String[] list) {
        return new JtTime( list[0], list[1], list[2], list[3], list[4] );
    }
}
```
## Calculate the total time spent
I then calculated the total time spent by summing the duration of each activity.
```java
int total = timeList.stream().map(JtTime::getDuration).reduce(Integer::sum).get();
System.out.println("Total heures: " + lib.sec2hours(total));
```
once I had the total time spent, I calculated the difference between the time spent and the time we should have spent, it was easy because the time we should have spent was written in the E-Mail.
```java
int diff = total - lib.hours2sec(expectedTotal);
if (diff == 0) {
    System.out.println("You have worked the exact amount of time");
} else if (diff < 0) {
    System.out.println("You don't have work enough, you are " + lib.sec2hours(-diff) + " short");
} else {
    System.out.println("You worked " + lib.sec2hours(diff) + " too much");
}
```
## Calculate the time spent on the different projects
To calculate the time spent on the different projects, I used the `groupingBy` function from the `Collectors` class, 
I started by grouping them depending on the programming language so that I would be able to get the time spent using the different programming languages
I then summed the durations and grouped them by activity, then I made the sum of durations for the activities
```java
System.out.println("Time spent per project:");
timeList.stream().collect(Collectors.groupingBy(a -> a.Project, Collectors.summingInt(JtTime::getDuration))).forEach((name, time) -> {
    System.out.println("\t" + name + ": " + lib.sec2hours(time));
    timeList.stream().filter(a -> Objects.equals(a.Project, name)).collect(Collectors.groupingBy(a -> a.Activity, Collectors.summingInt(JtTime::getDuration))).forEach((activityName, activityDuration) -> System.out.println("\t\t" + activityName + ": " + lib.sec2hours(activityDuration)));
});
```
## Key numbers
I then calculated the time spent in school, the time spent sick and the time spent on vacation, for this I had to filter the data so that I would only get the ones that interested me, 
I then started by making a list of the different activities that should be counted in the different categories

I started by making a custom class to represent the different categories so that it would be easy to add new categories if needed.
```java
public class Proj {
    String Project;
    String Activity;

    public Proj(String Project, String Activity) {
        this.Project = Project;
        this.Activity = Activity;
    }
    public boolean equal(JtTime a) {
        return Objects.equals(a.Project, this.Project) && Objects.equals(a.Activity, this.Activity);
    }
    public static boolean listContain(ArrayList<Proj> projectList, JtTime currentProject) {
        for (Proj a: projectList) {
            if (a.equal(currentProject)) {
                return false;
            }
        }
        return true;
    }
}
```
I then made a list of the different activities that should be counted in the different categories
```java
ArrayList<Proj> keyProject = new ArrayList<Proj>();
keyProject.add(new Proj("Administratif", "Vacances"));
keyProject.add(new Proj("Administratif", "CIE"));
keyProject.add(new Proj("Administratif", "EPSIC - Cours pro"));
keyProject.add(new Proj("Administratif", "Maladie"));
keyProject.add(new Proj("Formation", "Cours Alice"));
keyProject.add(new Proj("Formation", "Introduction apprentissage"));
```
I then calculated the time spent in the different categories
```java
System.out.println("Key numbers:");
ArrayList<Integer> sum = new ArrayList<Integer>();
keyProject.forEach(b -> {
    int duration = timeList.stream().filter(a -> b.equal(a)).map(JtTime::getDuration).reduce(Integer::sum).get();
    sum.add(duration);
    System.out.println("\t" + b.Activity + ": " + lib.sec2hours(duration) + " = " + duration * 100 / total + "%");
});
```
## Amount of time I was late at work
I then calculated the amount of time I was late at work, for this I had to filter the data as there was some days when I don't arrive at 8:10, for example school days start at 8:30 so I had to filter the data to remove the days when it was normal to arrive late.
```java
String beginWorkAt = "08:10";
System.out.println("You arrived " + timeList.stream()
        .collect(Collectors.groupingBy(a -> a.Date, Collectors.reducing((a, b) -> lib.hours2sec(a.Start) < lib.hours2sec(b.Start) ? a : b)))
        .values().stream().map(a -> a.get())
        .filter(a -> lib.hours2sec(a.Start) > lib.hours2sec(beginWorkAt) &&
                !(new Proj("Administratif","CIE").equal(a)) &&
                !(new Proj("Administratif","EPSIC - Cours pro").equal(a)) &&
                !(new Proj("Administratif","Maladie").equal(a)) &&
                !(new Proj("Administratif","Vacances").equal(a)) &&
                !(new Proj("Formation","Cours Alice").equal(a)))
        .count() + " times too late");
```
## Average time spent in coaching
Getting the average time spent in coaching was easy as I already did all the work above and it was done in 2 lines
```java
var coachings = timeList.stream().filter(a -> new Proj("Administratif","Coaching").equal(a)).map(JtTime::getDuration).toList();
System.out.println("Your coaching generaly last for " + lib.sec2hours(lib.sum(coachings) / coachings.size()));
```
## Price I cost to the society on the different projects
I then calculated the price I cost to the society on the different projects, the idea behind this is to makes us realize if we cost more than we bring in which case it would be unlikely that any company would hire us.
```java
private static int getCost(int workTime, int costPerHours) {return workTime * costPerHours / 3600;}
int costPerHours = 100;
System.out.println("Price cost to society: " + getCost(total,costPerHours) + ".- CHF");
System.out.println("\tMoney spent on code : " + getCost(timeList.stream()
        .filter(a -> !Objects.equals(a.Project, "Administratif") && !Objects.equals(a.Project, "Formation"))
        .map(a -> a.Duration).reduce(Integer::sum)
        .get(),costPerHours) + ".- CHF");
System.out.println("\tMoney spent on Other Stuff : " + getCost(timeList.stream()
        .filter(a -> (Objects.equals(a.Project, "Administratif") || Objects.equals(a.Project, "Formation")) && !Objects.equals(a.Activity, "Maladie"))
        .map(a -> a.Duration)
        .reduce(Integer::sum)
        .get(),costPerHours) + ".- CHF");
System.out.println("\tMoney spent when sick : " + getCost(timeList.stream()
        .filter(a -> Objects.equals(a.Project, "Administratif") && Objects.equals(a.Activity, "Maladie"))
        .map(a -> a.Duration)
        .reduce(Integer::sum)
        .get(),costPerHours) + ".- CHF");
```

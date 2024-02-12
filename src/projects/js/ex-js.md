# Ex Javascript <Badge type="tip" text="Javascript" />

Once the web integration was done, we started making [javascript exercises](https://github.com/Rignchen/ex-js-empty), these exercises were pretty similar to the java one as we had a few tests that were calling functions we had to implement

The first exercises were pretty simple, but then we had exercises where the input were not what we expected, for exemple we had functions were the doc tells us that the input will be a number, but in reality it was a string, and the test expected a crash.\
Then I discovered the Nan which for some reason is a number...
```js
export function isBiggerThan2(n) {
  if (isNaN(n)) {
    throw new Error("isBiggerThan2 only accept numbers")
  }
  return n > 2
}
```

Then we had to make web request to the GitHub api, so we had to use the fetch function, and then we had to make an async function, with the await keyword. I struggled a bit with this as I didn't think I had to use await after I got the fetch result.
```js
async function getOctocat() {
    const octocat = await fetch("https://api.github.com/octocat")
    return await octocat.text()
}
```

Once we had finish these, we started to learn about the DOM, and how to manipulate it. We had a few exercises with the DOM, like changing the color of a div, or adding a new element to the page.\
```js
/**
 * You need to change the color of the html element with the id "change-my-color"
 */
export function getElementFromDomAndChangeColorToRed() {
  const elements = document.querySelectorAll("#change-my-color")
  elements.forEach((element) => {
    element.style.color = "red"
  })
}
```


var title = document.querySelector("h1");
title.innerHTML = "Peter HUANG Yifei's Personal Website";


var pressButton = document.querySelector("#press");
pressButton.addEventListener("click", function() {
    alert("Pressed Successfully");
});

var aboutButton = document.querySelector("#about");
aboutButton.addEventListener("click", function() {
    alert("About Me Clicked");
});

var contactButton = document.querySelector("#contact");
contactButton.addEventListener("click", function() {
    alert("Contact Me Clicked");
});

var mynode =document.createElement("div");
//change basic attributes
mynode.id = "work1_intro";
mynode.innerHTML = "The work is this website";
mynode.style.color = "blue";

//add event listener
mynode.addEventListener("click", welcomeToWork1);
document.querySelector("#my_work1").appendChild(mynode);

function welcomeToWork1(){
    alert("welcome to work1");
    mynode.innerHTML = "Thank you for interest";
}
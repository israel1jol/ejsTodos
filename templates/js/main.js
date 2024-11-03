

const change1 = (e) => {
    e.preventDefault();
    const elem1 = document.querySelector(".user-context");
    const elem2 = document.querySelector(".side-context");

    elem1.setAttribute("style", "top:24%;left:28%;z-index:-1;");
    elem2.setAttribute("style", "top:30%;left:10%;z-index:1;");
}

const change2 = (e) => {
    e.preventDefault();
    const elem1 = document.querySelector(".user-context");
    const elem2 = document.querySelector(".side-context");

    elem2.setAttribute("style", "top:24%;left:28%;z-index:-1;");
    elem1.setAttribute("style", "top:30%;left:10%;z-index:1;");
}



document.getElementById("switch1").addEventListener("click", change1);
document.getElementById("switch2").addEventListener("click", change2);


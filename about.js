const moreContant = document.getElementById("more-Contant");
const showMore = document.getElementById("showMore");
const showLess = document.getElementById("showLess");


isHide = -1;
showMoreContant();

function showMoreContant(){
    if (window.innerWidth > 768) {
        document.querySelector("#showMore").style.display = "none";
        document.querySelector("#showLess").style.display = "none";
        moreContant.hidden= false;
    }else{
        document.querySelector("#showMore").style.display = "block";
        document.querySelector("#showLess").style.display = "block";
        isHide++;
        moreContant.hidden= isHide % 2 == 0;
        showLess.hidden= isHide % 2 == 0;
        showMore.hidden= isHide % 2 != 0;
    }
      
}
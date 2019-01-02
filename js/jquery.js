$(document).ready(function(){
  $(".info-logo").click(function(){
    $(".info").toggle();
  })
})

$(document).ready(function(){
  $(".close9").click(function(){
    $(".info").css('display','none');
  })
})

$(document).ready(function(){
  $(".procedure").click(function(){
    window.open('http://localhost:8000/%E4%BB%A3%E7%A0%81/WebGL%20environment/CP3WebGL/HTML5_DOM%20/HTML_Test.html')
  })
})

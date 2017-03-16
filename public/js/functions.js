var ww,wh,
	dbg,
	fc,
	LEN,
	NUMLINES;

jQuery(document).ready(function ($) {
	format();
});

$(window).resize(function(){ 
	format();
});

$(window).load(function(){ 
	$("body").removeClass("loading");
	init();
});



function init(){
	//if(window.location.hostname == "localhost")dbg = true;
	dbg = window.location.hostname == "localhost";
	isTouchDevice = 'ontouchstart' in document.documentElement;
	if(ww < 768)isTouchDevice = true;

	bindEvents();
	initObjects();
}

function initObjects(){
	
}

function bindEvents(){
	$(".card-full img").on('load', function(){ 
		console.log("loaded");
		format();
	});

	$("html").on('click', 'article.col-md-3.card', function(event) {
		$("body").addClass('loading');
		event.preventDefault();
		/* Act on the event */
		$el = $(this);
		var id = $el.attr("id");
		var pid = $el.data("pid");
		console.log(id)
		
		$('article.card').removeClass('current');
		$el.addClass('current');
		
		$(".card-full").remove();

		$.ajax({
			method: "GET",
			url: "/api/image/"+id+"/"+pid, 
			//data: {id: id},
			success: function(html){
	        	//console.log(html)
	        	$("body").removeClass('loading');

	        	if(isTouchDevice){
		        	$el.after(html).imagesLoaded().then(function(){
	       				format();

	       				$("html,body").animate({
	       					scrollTop: $(".card-full").position().top
	       				}, 600, 'easeInOutExpo')
	        		});
	        	}else{
		        	$el.parents(".row").after(html).imagesLoaded().then(function(){
	       				format();

	       				$("html,body").animate({
	       					scrollTop: $(".card-full").position().top
	       				}, 600, 'easeInOutExpo')
	        		});
	        	}
	        	
	    	},
	    	error: function (xhr, ajaxOptions, thrownError) {
	    		//cb(xhr.responseText);
	    	}
		});
	});

	$("html").on('submit', '#comments form', function(event) {
		$("body").addClass('loading');
		event.preventDefault();

		var u = $(this).attr("action");
		var d = $(this).serialize();
		console.log(d)
		$.ajax({
			method: "POST",
			url: u, 
			data: d,
			success: function(response){
				$("body").removeClass('loading');
	        	console.log(response)
	        	if(response.sucess){
	        		$(".comments").append(response.comment);
	        		$("texarea").val('');
	        	}
	    	},
	    	error: function (xhr, ajaxOptions, thrownError) {
	    		//cb(xhr.responseText);
	    	}
		});
	});

	$("html").on('submit', '#upload form', function(event) {
		$("body").addClass('loading');
		event.preventDefault();

		var $form = $(this);
        var formdata = (window.FormData) ? new FormData($form[0]) : null;
        var data = (formdata !== null) ? formdata : $form.serialize();
 
        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json', // selon le retour attendu
            data: data,
            progress: function(e) {
               	if(e.lengthComputable) {
               		$(".progress-bar")
            			.removeClass("progress-bar-success")
            			.addClass("progress-bar-info")

                   	var pct = (e.loaded / e.total) * 100;

                   	//log percentage loaded
                   	console.log(pct);
                   	$(".progress .sr-only").text(pct+"%");
                   	$(".progress-bar").css({width:pct+"%"});
                }else {
                   	console.warn('Content Length not reported!');
                }
           	},
            success: function (response) {
            	$(".progress-bar")
            		.removeClass("progress-bar-info")
            		.addClass("progress-bar-success")
                // La réponse du serveur
                console.log(response)
                location.reload();
            }
        });
	});

	$("html").on('click', 'a.ajax', function(event) {
		event.preventDefault();

		$.ajax({
		    url: $(this).attr("href"),
		    type: 'GET',
		    
		    success: function(data, textStatus, jqXHR)  {
		        console.log(data);
		        if(data.success == true)
			        location.reload();
			    else
			    	alert(data.mess)
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
		        //callback({ errors: [textStatus] })
		    }
		});
	});

}

function uploadFiles(files, url, callback) {
    var data = new FormData();
    $.each(files, function(key, value) {
        data.append('image-' + key, value);
    });
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR)  {
            callback(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            callback({ errors: [textStatus] })
        }
    });
}

function setUpVars(){
	var LEN = $("article.card").length;
	var NUMLINES = 0;

	var c = 1;
	for(var i=1; i<LEN+1; i++){
		console.log(i,c)
		if(c==1)NUMLINES++;	
		if(c == 4)c = 0;
		c++;
	}
}

function lineOfCard($div){
	var c = 1;
	var line = 0;
	var idx = $div.index();
	$("article.card").each(function(index, el) {
		//if(c==1)line++;	
		if(c == 5)c = 1;
		console.log(idx, index, c)
		if(index > idx  && c==4){
			console.log("eeeeeeeeeeeeee")
			//$(el).after("ici");
			$ret = $(el);
			return false;
		}

		c++;
	});

	return $ret;
	//console.log(idx, len, numLines)
}

function format(){
	ww = $(window).width();
	wh = $(window).height();

	var iH = $(".col-md-9").find("img").outerHeight();
	
	if(iH != 0)$(".card-full").find(".col-md-3").css({"max-height": iH})
}
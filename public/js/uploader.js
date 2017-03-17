// variables
var dropArea = document.getElementById('dropArea');
//var canvas = document.querySelector('canvas');
//var context = canvas.getContext('2d');
//var count = document.getElementById('count');
var destinationUrl = document.querySelector('.upload');
//var result = document.getElementById('result');
var list = [];
var total = 0;
var totalSize = 0;
var totalProgress = 0;

// initialisation
(function(){

    // gestionnaires
    function initHandlers() {
        dropArea.addEventListener('drop', handleDrop, false);
        dropArea.addEventListener('dragover', handleDragOver, false);
    }

    // affichage de la progression
    function drawProgress(progress) {
        /*context.clearRect(0, 0, canvas.width, canvas.height); // effacer le canvas

        context.beginPath();
        context.strokeStyle = '#4B9500';
        context.fillStyle = '#4B9500';
        context.fillRect(0, 0, progress * 500, 20);
        context.closePath();

        // affichage de la progression (mode texte)
        context.font = '16px Verdana';
        context.fillStyle = '#000';
        context.fillText('Progression : ' + Math.floor(progress*100) + ' %', 50, 15);*/
        //console.log(Math.floor(progress*100))
   		

       	var pct = Math.floor(progress*100);

       	//log percentage loaded
       	console.log(pct);
       	$(".progress .sr-only").text(pct+"%");
       	$(".progress-bar").css({width:pct+"%"});

    }

    // survol lors du déplacement
    function handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();

        dropArea.className = 'hover';
    }

    // glisser déposer
    function handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();

        processFiles(event.dataTransfer.files);
    }

    // traitement du lot de fichiers
    function processFiles(filelist) {
        if (!filelist || !filelist.length || list.length) return;

        totalSize = 0;
        totalProgress = 0;
        //result.textContent = '';
        total = filelist.length
        for (var i = 0; i < filelist.length && i < 5; i++) {
            list.push(filelist[i]);
            totalSize += filelist[i].size;
        }
        uploadNext();
    }

    // à la fin, traiter le fichier suivant
    function handleComplete(size) {
        totalProgress += size;
        drawProgress(totalProgress / totalSize);
        uploadNext();
    }

    // mise à jour de la progression
    function handleProgress(event) {
        var progress = totalProgress + event.loaded;
        drawProgress(progress / totalSize);
    }

    // transfert du fichier
    function uploadFile(file, status) {

        // création de l'objet XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open('POST', destinationUrl.action);
        xhr.onload = function() {
            //result.innerHTML += this.responseText;
            handleComplete(file.size);
        };
        xhr.onerror = function() {
            //result.textContent = this.responseText;
            handleComplete(file.size);
        };
        xhr.upload.onprogress = function(event) {
            handleProgress(event);
        }
        xhr.upload.onloadstart = function(event) {
        	$(".progress .sr-only").text(0+"%");
            $(".progress-bar").css({width:0+"%"});
       		$(".progress-wrapper").removeClass("hidden");
       		$(".progress-bar")
    			.removeClass("progress-bar-success")
    			.addClass("progress-bar-info")
        }

        // création de l'objet FormData
        var formData = new FormData();
        formData.append('media', file);
        formData.append('uploaded_by', $("input[name='uploaded_by']").val());
        formData.append('parent', $("input[name='parent']").val());
   
        xhr.send(formData);
    }

    // transfert du fichier suivant
    function uploadNext() {
        if (list.length) {
            dropArea.textContent = (list.length - 1)+"/"+total;
            dropArea.className = 'uploading';

            var nextFile = list.shift();
            uploadFile(nextFile, status);
        } else {
            dropArea.className = '';

			$(".progress-bar")
				.removeClass("progress-bar-info")
				.addClass("progress-bar-success")

			location.reload();
        }
    }

    initHandlers();
})();
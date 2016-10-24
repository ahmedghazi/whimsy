// Return a helper with preserved width of cells  
var fixHelper = function(e, ui) {  
  ui.children().each(function() {  
    $(this).width($(this).width());  
  });  
  return ui;  
};

var formController = function(){
	var _this = this,
		$target,
		data_input_target;

	this.init = function(){
		_this.bindEvents();
	};

	this.bindEvents = function(){
	    $("html").on('click', '.remove-row', function(event) {
	    	event.preventDefault();
	    	$(this).parents("fieldset").remove();
	    });

	    $("html").on('click', '.add-row', function(event) {
	    	event.preventDefault();

	    	$("body").addClass('loading');
	    	var c = $("fieldset").length;

			$.ajax({
				method: "POST",
				url: "/admin/products/add-row", 
				data: {c: c},
				success: function(html){
		        	$(".repeater").append(html);
	    			$("body").removeClass('loading');

	    			setTimeout(function(){
	    				$("fieldset").last().find("input").first().focus();
	    			},400);
		    	},
		    	error: function (xhr, ajaxOptions, thrownError) {
		    		//cb(xhr.responseText);
		    	}
			});
	    });

		$(".ajax").on("click", function(e){
			e.preventDefault();
			data_input_target = $(this).data("input-target")
			$target = $($(this).data("target"));
			$target.find(".modal-body").load( $(this).attr("href"), function() {
				$target.modal()
			});
		});

		//$(".media-select").on("click", function(e){
		$("html").on("click", ".media-select", function(e){
			e.preventDefault();
			var id = $(this).data("id");
			//$("input[name='"+data_input_target+"']").val(id);

			//$clone = $(this).parents("tr").clone();
			$clone = $("tr#"+id).clone();
			console.log(id)
			console.log($clone)
			console.log(data_input_target)
			//$clone.find("input[type='hidden']").attr("name", data_input_target);
			$(".table."+data_input_target+"").append($clone);
			
			//$("#media_select").html($clone);
			console.log(data_input_target)
	
			//$target.modal("hide")
		});

		$("html").on("click", ".media-remove", function(e){
			$(this).parents("tr").remove();
			
		});

		$("html").on("click", ".videos-select", function(e){
			e.preventDefault();
			var id = $(this).data("id");
			console.log(id)
		
			$clone = $(this).parents("tr").clone();
			console.log($clone)
			//$(this).parents("tr").remove();
			$("#row-videos table tbody").append($clone);

			$("#modal_video").modal("hide");
		});

		$("html").on("click", ".videos-remove", function(e){
			e.preventDefault();
			var id = $(this).data("id");
			$("input[value='"+id+"']").remove();
			$(this).parents("tr").remove();
			if($("input[name='videos[]']").length == 0){
				var html = '<input type="hidden" name="videos" value="[]">';
				//$("#form-chefs-edit").prepend(html);
			}
			alert("vidéos déselectionnée");
		});

		

		$(".edit tbody").sortable({
			helper: fixHelper,
			placeholder: "ui-state-highlight",
			stop: function( event, ui ) {
				console.log("done")
			}
		}).disableSelection(); 

		$(".ajax-upload").on("submit", function(e){
			e.preventDefault();
			
			var $form = $(this);
	        var formdata = (window.FormData) ? new FormData($form[0]) : null;
	        var data = (formdata !== null) ? formdata : $form.serialize();
	 		console.log(data)
	 		
	        $.ajax({
	            url: $form.attr('action'),
	            type: $form.attr('method'),
	            contentType: false, // obligatoire pour de l'upload
	            processData: false, // obligatoire pour de l'upload
	            dataType: 'json', // selon le retour attendu
	            data: data,
	            success: function (response) {
	            	console.log(response)
	            	alert("Image uploadé");
	            	$("input[name='media_portrait2']").val(response._id);
	            	$(".preview").removeClass('hidden');
	                // La réponse du serveur
	            }
	        });
		});

		var inputs = document.querySelectorAll( '.inputfile' );
		
		Array.prototype.forEach.call( inputs, function( input )
		{
			var output = document.querySelector( '.preview' );

			input.addEventListener( 'change', function( e )
			{
				//label.innerHTML = "Modifier";
				output.onload = function(){
					var fileSize = $(input).get(0).files[0].size;
					if(fileSize > 1000000){						
						$(input).val("");
						output.src = "";
						alert("Votre image est trop lourde, 1Mo max.");
					}

	    			
				}
    			output.src = URL.createObjectURL(e.target.files[0]);
    		

			});
		});


		

		$("#sort1 tbody").sortable({
			helper: fixHelper,
			placeholder: "ui-state-highlight",
			stop: function( event, ui ) {
				_this.reorderSemainesChefsSelected();
			}
		}).disableSelection();  

		 
	};

	

	this.postData = function(u,d,cb){
		$.ajax({
			method: "POST",
			url: u, 
			data: d,
			success: function(result){
	        	cb(result);
	    	},
	    	error: function (xhr, ajaxOptions, thrownError) {
	    		cb(xhr.responseText);
	    	}
		});
    };
	
};


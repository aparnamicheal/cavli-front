var SERVER = 'https://test-aws-1.herokuapp.com/';
//var SERVER = "http://127.0.0.1:8082/";
const allowed_file_types = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
function save_item() {
  var fileName = $('#fileName').val();
  var theFormFile = $('#file')[0].files[0];
  $("#alert").addClass("loading");
  $("#alert").html("Loading...");

  if (!fileName || fileName == "") {
    alert_error("File Name is required");
    return;
  }
  if (!theFormFile) {
    alert_error("File is required");
    return;
  }

  $.ajax({
    type: 'POST',
    url: SERVER + fileName,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // this flag is important, if not set, it will try to send data as a form
    processData: false,
    success: function (data, status, xhttp) {
      if (status === 'success') {
        alert_success("Uploading file to S3..");
        sendFile(data.signedUrl);
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      const err_text = JSON.parse(xhr.responseText);
      alert_error(err_text.error.message);
    }
  })
  function sendFile(signedUrl) {
    // get the reference to the actual file in the input
    var theFormFile = $('#file')[0].files[0];
    //console.log($('#img')[0].files[0]);
    console.log(theFormFile);
    $.ajax({
      type: 'PUT',
      url: signedUrl,
      // Content type must much with the parameter you signed your URL with
      contentType: 'binary/octet-stream',
      // this flag is important, if not set, it will try to send data as a form
      processData: false,
      // the actual file is sent raw
      data: theFormFile,
      ContentDisposition: 'inline;', //<-- and this !,
      success: function (data) {
        //console.log(data);
        alert_success("File uploaded successfully");
      },

      error: function (xhr, ajaxOptions, thrownError) {
        const err_text = JSON.parse(xhr.responseText);
        alert_error(err_text.error.message);
      }
    })

    return false;
  };
  return false;
}

function file_validate() {
  var file = $('#file')[0].files[0];
  if (!allowed_file_types.includes(file.type)) {
    alert_error(file.type + ' type file is not allowed');
  }
  else {
    $("#img-preview").attr("src", window.URL.createObjectURL(file));
  }
}
function alert_error(msg) {
  $("#alert").addClass("error").removeClass("loading");
  $("#alert").html(msg);
  setTimeout(function () { $("#alert").removeClass("error"); }, 3000);
}
function alert_success(msg) {
  $("#alert").addClass("success").removeClass("loading");
  $("#alert").html(msg);
  setTimeout(function () { $("#alert").removeClass("success"); }, 3000);
}
function alert_loading(msg) {
  $("#alert").addClass("loading").removeClass("success").removeClass("error");
  $("#alert").html(msg);
}
function getAllFiles() {
  $('#Add_new').fadeTo("slow", 1);
  $('#fileTable').find('tbody').empty();
  alert_loading("Loading..");
  $.ajax({
    type: 'GET',
    url: SERVER,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // this flag is important, if not set, it will try to send data as a form
    processData: false,
    success: function (data, status, xhttp) {
      if (status === 'success') {
        //alert_success("Uploading file to S3..");
        $("#alert").removeClass("loading");
        listFiles(data);
      }
    },
    error:function (xhr, ajaxOptions, thrownError){
      const err_text= JSON.parse(xhr.responseText);
      alert_error(err_text.error.message); 
      $('#fileTable').empty();     
  }
  })
}
function listFiles(files) {
  console.log(files);
  $('#fileTable').fadeTo("slow", 1);
  $('#fileTable').find('tbody').empty();
  for (var i = 0; i < files.length; i++) {
    $('#fileTable').append('<tr>  <td>' + files[i].fileName + '</td>   <td><a href=' + files[i].url + '>' + files[i].url + '</a></td>   <td>' + files[i].createdAt.slice(0, 10) + '</td>   <td><button onclick=deleteById("' + files[i]._id + '") class="btn btn-danger">Delete</button></td>   </tr>');
  }
}
function deleteById(id) {
  alert_loading("Loading..");
  console.log(id);
  $.ajax({
    type: 'DELETE',
    url: SERVER + id,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // this flag is important, if not set, it will try to send data as a form
    processData: false,
    success: function (data, status, xhttp) {
      if (status === 'success') {
        getAllFiles()
        alert_success("Deleted");
        //listFiles(data);
      }
    },
    error:function (xhr, ajaxOptions, thrownError){
      const err_text= JSON.parse(xhr.responseText);
      alert_error(err_text.error.message);      
  }
  })
}
function save_cred() {
  var accessKeyId = $('#accessKeyId').val();
  var secretAccessKey = $('#secretAccessKey').val();

  if (!accessKeyId || accessKeyId == "") {
    alert_error("accessKeyId is required");
    return;
  }
  if (!secretAccessKey || secretAccessKey == "") {
    alert_error("secretAccessKey is required");
    return;
  }
  alert_loading("Loading..");
  $.ajax({
    type: 'POST',
    url: SERVER + "s3/save-cred",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // this flag is important, if not set, it will try to send data as a form
    processData: false,
    data: JSON.stringify({ accessKeyId, secretAccessKey }),
    success: function (data, status, xhttp) {
      if (status === 'success') {
        alert_success("Saved");
        //listFiles(data);
      }
    },
    error:function (xhr, ajaxOptions, thrownError){
      const err_text= JSON.parse(xhr.responseText);
      alert_error(err_text.error.message);      
  }
  })
}

function is_cred_exists() {
  alert_loading("Loading..");
  $.ajax({
    type: 'GET',
    url: SERVER + "s3/cred-exists",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // this flag is important, if not set, it will try to send data as a form
    processData: false,
    success: function (data, status, xhttp) {
      if (status === 'success') {
        getAllFiles();
      }
    },
    error:function (xhr, ajaxOptions, thrownError){
      const err_text= JSON.parse(xhr.responseText);
      window.location.href = "add-s3.html";    
  }
  })
}



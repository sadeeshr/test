// var appToken;
// var authUri;
// var mdHandle;

var permsHandle;
var permSetHandle;
var entriesHandle;
var signKeyHandle;
var nfsHandle;
var fileHandle;
var fileName;
var fileContent;
var mdName;
var hashedString;

var publicId;

var file = document.getElementById("fileinput");
var filepath = document.getElementById("filepath");
var container = 'apps/smartjuice';

function init() {
    
    // if(!localStorage.getItem("appToken")) {
    let appInfo = {
                id: 'smartjuice',
                name: 'Login Demo',
                vendor: 'Telerain Inc.'
            };

            window.safeApp.initialise(appInfo)
            .then(function(res) {
                localStorage.setItem("appToken", res);
                log('Returns app token: ' + res);
                authorise();
            }); 
    // } else {
    //     console.log("App Token: ", localStorage.getItem("appToken"));
    // }    
};

function authorise() {
  // check SAFE browser authenticator for authorization request
      let appToken = localStorage.getItem("appToken");
      window.safeApp.authorise(
      	appToken,
      	{
          _public: [
            'Read',
            'Insert',
            'Update',
            'Delete'
          ],
          _publicNames: [
            'Read',
            'Insert',
            'Update',
            'Delete'
          ]
      	},
      	{own_container: true}
      ).then((res) => {
      	let authUri = res;
        log('App was authorised and auth URI received: ' + res);
        window.safeApp.connectAuthorised(appToken, authUri)
          .then(appToken => {
              localStorage.setItem("appToken") = appToken;
          log('The app was authorised and a session was created with the network. App token returned: ' + appToken);
        });        
      });
       
}

function create_public_md() {
    let appToken = localStorage.getItem("appToken");
    window.safeMutableData.newRandomPublic(appToken, 15002)
      .then((res) => {
      	mdHandle = res;
        log('Returns handle to newly created, public, randomly named MutableData structure: ' + res);
      });
}

function create_private_md() {
    window.safeMutableData.newRandomPrivate(appToken, 15002)
        .then((res) => {
            mdHandle = res;
            log('Returns handle to newly created, public, randomly named MutableData structure: ' + res);
        });
}

function register() {
      let appToken = localStorage.getItem("appToken");
      let hashedString, publicId, mdHandle;

      let UI_fname = document.getElementById("firstname").value;
      let UI_lname = document.getElementById("lastname").value;
      let UI_username = document.getElementById("username").value;
      let UI_password = document.getElementById("password").value;
      let UI_email = document.getElementById("email").value;
    //   let hashedString;

      window.safeCrypto.sha3Hash(appToken, UI_username)
      .then((res) => {
        hashedString = res;
        publicId = UI_username;
        localStorage.setItem("hashedString", res);
        localStorage.setItem("publicId", UI_username);

          log('SHA3 Hash generated: ', String.fromCharCode.apply(null, new Uint8Array(res)));
      })
      .then(() => {
          window.safeMutableData.newPublic(appToken, hashedString, 15001)
            .then((res) => {
                mdHandle = res;
                localStorage.setItem("mdHandle", res);
                log('Returns handle to newly created or already existing, public, explicitly named Mutable Data structure: ' + res);
            })
            .then(() => {
                window.safeMutableData.quickSetup(mdHandle, {
                    firstname: UI_fname,
                    lastname: UI_lname,
                    username: UI_username,
                    password: UI_password,
                    email: UI_email
                    })
                .then((res) => {
                    mdHandle = res;
                    log('Returns original mdHandle: ' + res);
                    alert("Registered. Login Now");
                    window.location = 'index.html';
                    fetch_username();
                    fetch_password();
                })
            })
      })
      .then(() => {
        window.safeMutableData.getEntries(mdHandle).then(res => {
            let entriesHandle = res;
            log('Returns handle for safeMutableDataEntries operations: ' + res);
        })
        .then(() => {
            window.safeMutableDataEntries.insert(entriesHandle, 'is_admin', 'no').then(_ => log('New entry inserted'));
        })            
      })
}

function fetch_username() {
    let mdHandle = localStorage.getItem("mdHandle");
    window.safeMutableData.get(mdHandle, 'username')
        .then((value) => {
            log('Username Value: ' + String.fromCharCode.apply(null, new Uint8Array(value.buf)));
        })
        .catch((err) => {
                alert("Username ERROR: ", err);
        });
}

function fetch_password() {
    let mdHandle = localStorage.getItem("mdHandle");
    window.safeMutableData.get(mdHandle, 'password')
        .then((value) => {
            log('Password Value: ' + String.fromCharCode.apply(null, new Uint8Array(value.buf)));
        }) 
        .catch((err) => {
                alert("Password ERROR: ", err);
        }); 
}

function login() {
      let appToken = localStorage.getItem("appToken");
      let hashedString, publicId, mdHandle, sf_username, sf_password, entriesHandle;

      let L_username = document.getElementById("login_username").value;
      let L_password = document.getElementById("login_password").value;
   

      log('User Entered Username Value: ' + L_username);
      log('User Entered Password Value: ' + L_password);

      window.safeCrypto.sha3Hash(appToken, L_username)
      .then((res) => {
        hashedString = res;
        publicId = L_username;
        localStorage.setItem("hashedString", res);
        localStorage.setItem("publicId", L_username);
          log('SHA3 Hash generated: ', String.fromCharCode.apply(null, new Uint8Array(res)));
      })
      .then(() => {
          window.safeMutableData.newPublic(appToken, hashedString, 15001)
            .then((res) => {
                mdHandle = res;
                localStorage.setItem("mdHandle", res);
                log('Returns handle to newly created or already existing, public, explicitly named Mutable Data structure: ' + res);
            })
            .then(() => {
               window.safeMutableData.get(mdHandle, 'username')
                .then((value) => {
                    sf_username = String.fromCharCode.apply(null, new Uint8Array(value.buf));
                    log('Stored Username Value: ' + String.fromCharCode.apply(null, new Uint8Array(value.buf)));
                })
                .then(() => {
                    window.safeMutableData.get(mdHandle, 'password')
                        .then((value) => {
                            sf_password = String.fromCharCode.apply(null, new Uint8Array(value.buf));
                            log('Stored Password Value: ' + String.fromCharCode.apply(null, new Uint8Array(value.buf)));
                        })
                        .then(() => {
                            if (L_username.toString().trim() === sf_username.toString().trim() && L_password.toString().trim() === sf_password.toString().trim()) {
                                log("Authentication Completed, Success");
                                alert("Authentication Completed, Success");
                                window.safeMutableData.getEntries(mdHandle)
                                    .then((res) => {
                                        entriesHandle = res;
                                        log('Returns handle for safeMutableDataEntries operations: ' + res);
                                })
                                .then(() => {
                                window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {
                                        let key = String.fromCharCode.apply(null, k);
                                        let value = String.fromCharCode.apply(null, new Uint8Array(v.buf));
                                        // this.send('forEachResult', {key: key, value: v.buf});
                                        console.log("Entry: (", k.toString(), ",", v.buf.toString(), ")");
                                        localStorage.setItem(k.toString(), v.buf.toString());                                        
                                    })
                                    // .then(_ => forEachResults.join('\n')) 
                                    // .then(_ => log(forEachResults)) 
                                    window.location = 'home.html';
                                })   
                            } else {
                                alert("Authentication Failed");
                                log("Authentication Failed");
                            }
                        })
                })
                .catch((err) => {
                        alert("Authentication ERROR: Invalid Username / Password", err);
                })
            })            
      });
}

function getProfile() {
    document.getElementById('username').value = localStorage.getItem("username");
    document.getElementById('firstname').value = localStorage.getItem("firstname");
    document.getElementById('lastname').value = localStorage.getItem("lastname");
    document.getElementById('email').value = localStorage.getItem("email");
    
}

function uploadfile() {
    let auth = localStorage.getItem("appToken");
  window.safeApp.getContainer(auth, container)
    .then((mdHandle) => {
        console.log(mdHandle);
      window.safeMutableData.newMutation(auth)
        .then((mutationHandle) =>
          window.safeMutableDataMutation.insert(mutationHandle, file.files[0].name, fileContent)
          .then(() =>
            window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle))
          .then(() => {
            log('New entry was inserted in the MutableData and committed to the network');
            showfiles();
          })
        )}, (err) => {
      console.error(err);
      log(err);
    });
}

function deletefile() {
    let auth = localStorage.getItem("appToken");
  window.safeApp.getContainer(auth, container)
    .then((mdHandle) => {
      window.safeMutableData.newMutation(auth)
        .then((mutationHandle) => {
          window.safeMutableData.get(mdHandle, filepath.value)
            .then((value) => {
              window.safeMutableDataMutation.remove(mutationHandle, filepath.value, value.version + 1);
              window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle);
            }, (err) => {
              console.error(err);
              // Materialize.toast(err, 3000, 'rounded');
            });
        })
        .then(() => {
          log('Entry was removed from the MutableData and committed to the network');
          //console.log('Entry was removed from the MutableData and committed to the network');
        });
      // window.safeMutableDataMutation.free(mutationHandle);
      // window.safeMutableData.free(mdHandle);
    }, (err) => {
      console.error(err);
      // Materialize.toast(err, 3000, 'rounded');
    });
}

function showfiles() {
    let auth = localStorage.getItem("appToken");    
    window.safeApp.getContainer(auth, container)
      .then((mdHandle) => {
        // console.log(mdHandle);
        fileshow.innerHTML = "";
  
        //can be used for identifing the Container but is mot needed here
        // window.safeMutableData.getNameAndTag(mdHandle)
        //   .then((data) =>
        // console.log(data));
  
        window.safeMutableData.getEntries(mdHandle)
          .then((entriesHandle) => {
            $("#fileshow").append("<div class='files'><h3>Uploaded Files</h3><br><br>");
            window.safeMutableDataEntries.forEach(entriesHandle,
              (key, value) => {
                // console.log('Entry Handle: ', entriesHandle);
                console.log('File found: ', uintToString(key));
                // console.log('Value: ', uintToString(value.buf));
                // console.log(key, value);
                // var inputElement = document.createElement('input');
                // inputElement.type = "button"
                // inputElement.addEventListener('click', function(){
                //     getfile(uintToString(key));
                // });
                
                // ​$("#fileshow").append(inputElement);​
                $("#fileshow").append(uintToString(key));
              });

            //   ​$("#fileshow").append("</div>");​
  
            // window.safeMutableDataEntries.free(entriesHandle);
            // window.safeMutableData.free(mdHandle);
          });
      }, (err) => {
        console.error(err);
        // Materialize.toast(err, 3000, 'rounded');
      });
  }

  function uintToString(uintArray) {
    return new TextDecoder("utf-8").decode(uintArray);
  }

function getfile() {
    let auth = localStorage.getItem("appToken");
    
  window.safeApp.getContainer(auth, container)
    .then((mdHandle) => {

      //change key
      window.safeMutableData.get(mdHandle, filepath.value)
        .then((value) => {
          readfile(filepath.value, value.buf);

          console.log(value);
          console.log('Value: ', uintToString(value.buf));
          console.log('Version: ', value.version);

          // window.safeMutableData.free(mdHandle);
        });
    }, (err) => {
      console.error(err);
      // Materialize.toast(err, 3000, 'rounded');

    });
}

function readfile(name, filecontent) {
  fileshow.innerHTML = "";
  var file = new File([filecontent], name);
  console.log("Your file is a " + name.split('.').pop() + " file.");
  log("Your file is a " + name.split('.').pop() + " file.");

  switch (name.split('.').pop()) {
    //text
    case "txt":
    case "html":
    case "htm":
    case "css":
    case "js":
    case "json":
    case "md":
    case "odt":
    case "rtf":
    case "csv":
      readAsText();
      break;
      //images
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "tiff":
    case "tif":
    case "ico":
    case "webp":
    case "svg":
    case "bmp":
      readAsImage();
      break;
      //audio
    case "mp3":
    case "oga":
    case "wav":
      readAsAudio();
      break;
      //video
    case "mp4":
    case "ogv":
    case "ogg":
    case "webm":
      readAsVideo();
      break;
    default:
      //default
      download();
  }

  //reads file as text
  function readAsText() {
    var reader = new FileReader();
    reader.onload = function() {
      var url = window.URL.createObjectURL(file);
      fileshow.innerHTML = '<textarea id="textarea" class="materialize-textarea">' + this.result + '</textarea><button id="saveedit" class="waves-effect waves-yellow btn blue">Save Edit</button><a id="downloadfile" class="waves-effect waves-light btn blue" href="' + url + '" download="' + file.name + '">Download file</a>';
      $('textarea').each(function() {
        $(this).height($(this).prop('scrollHeight'));
      });
      window.document.getElementById("saveedit").addEventListener("click", function() {
        saveedit();
      });
    };
    reader.readAsText(file);
  }

  //reads file as image
  function readAsImage() {
    var url = window.URL.createObjectURL(file);
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
      fileshow.innerHTML = '<img class="responsive-img" src="' + this.result + '"></img><a id="downloadfile" class="waves-effect waves-light btn blue" href="' + url + '" download="' + file.name + '">Download file</a>';
    };
    fileReader.readAsDataURL(file);
  }

  //reads file as audio
  function readAsAudio() {
    var url = window.URL.createObjectURL(file);
    fileshow.innerHTML = '<audio id="sound" controls></audio><a id="downloadfile" class="waves-effect waves-light btn blue" href="' + url + '" download="' + file.name + '">Download file</a>';
    var sound = document.getElementById('sound');
    sound.src = URL.createObjectURL(file);
  }

  //reads file as video
  function readAsVideo() {
    var url = window.URL.createObjectURL(file);
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
      fileshow.innerHTML = '<video controls><source src="' + url + '" type="' + file.type + '"></video>';
    };
    fileReader.readAsDataURL(file);
  }

  //default
  function download() {
    console.log(file.name);
    var url = window.URL.createObjectURL(file);
    fileshow.innerHTML = '<a id="downloadfile" class="waves-effect waves-light btn blue" href="' + url + '" download="' + file.name + '">Download file</a>';
  }
}

function picUpload() {
// window.safeMutableData.newRandomPublic(appToken, 15002)
//       .then((res) => {
//       	mdHandle = res;
//         log('Returns handle to newly created, public, randomly named MutableData structure: ' + res);
//       })
//       .then(() => {
    let appToken = localStorage.getItem("appToken");
    let mdHandle = localStorage.getItem("mdHandle");
    let hashedString = localStorage.getItem("hashedString");
    let username = localStorage.getItem("username");

    let permsHandle, permSetHandle, entriesHandle, signKeyHandle, nfsHandle, fileHandle;
    
    window.safeMutableData.newPermissions(appToken)
        .then((res) => {
            permsHandle = res;
            log('Newly created permissions handle returned: ' + res);
        })
        .then(() => {
            window.safeMutableData.newPermissionSet(appToken)
                .then((res) => {
                    permSetHandle = res;
                    log('Returns newly created PermissionsSet handle: ' + res);
                })
                .then(() => {
                    window.safeMutableData.newEntries(appToken)
                        .then((res) => {
                            entriesHandle = res;
                            log('Returns an entries handle to be used with safeMutableDataEntries functions: ' + res);
                        })
                        .then(() => {
                                window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Insert")
                                    .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Update"))
                                    .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Delete"))     
                                    .then(() => {
                                        window.safeCrypto.getAppPubSignKey(appToken)
                                            .then((res) => {
                                                signKeyHandle = res;
                                                log('Returns applications public signing key: ' + res);
                                            })
                                            .then(() => {
                                                    window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permSetHandle)
                                                        .then(_ => {
                                                            log('Finished inserting new permissions');
                                                        })
                                                        .then(() => {
                                                                // window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
                                                                //     .then(_ => {
                                                                //         log('Finished creating and committing MutableData to the network');
                                                                //     })
                                                                //     .then(() => {
                                                                        window.safeMutableData.emulateAs(mdHandle, 'NFS')
                                                                            .then((res) => {
                                                                                nfsHandle = res;
                                                                                log('Returns nfsHandle: ' + res);
                                                                            })
                                                                            .then(() => {
                                                                                    console.log(fileContent);
                                                                                    window.safeNfs.create(nfsHandle, fileContent)
                                                                                    .then((res) => {
                                                                                        fileHandle = res;
                                                                                        log('Returns the file handle of a newly created file: ' + res);
                                                                                    })
                                                                                    .then(() => {
                                                                                         let fileName = 'profile.png';
                                                                                            window.safeNfs.insert(nfsHandle, fileHandle, fileName)
                                                                                            .then(res => {
                                                                                                fileHandle = res;
                                                                                                log('Returns same fileHandle: ' + res);
                                                                                            })
                                                                                            .then(() => {
                                                                                                window.safeMutableData.getNameAndTag(mdHandle)
                                                                                                    .then((res) => {
                                                                                                        mdName = res.name.buffer;
                                                                                                        log('Name: ' + String.fromCharCode.apply(null, new Uint8Array(res.name.buffer)) + ', Tag: ' + res.tag);
                                                                                                    })
                                                                                                    .then(() => {
                                                                                                        // var serviceId=Math.random();
                                                                                                        window.safeMutableDataEntries.insert(entriesHandle, serviceId, mdName)
                                                                                                            .then(_ => 'New entry inserted')
                                                                                                            .then(() => {
                                                                                                                window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
                                                                                                                    .then(_ => {
                                                                                                                        log('Finished creating and committing MutableData to the network');
                                                                                                                        // alert('File Saved on Safe Network: '+fileName);
                                                                                                                        var fileUrl = 'safe://' + serviceId + '.' + username +'/' + fileName;
                                                                                                                        console.log(fileUrl);
                                                                                                                        alert('File Saved on Safe Network: '+fileName, fileUrl);
                                                                                                                        // var lspan = document.createElement('span');
                                                                                                                        // lspan.innerHTML = ['Safe URL for the uploaded file : <a class="btn btn-lg btn-info" href="', fileUrl,'" target="_blank">', fileUrl, '</a>'].join('');
                                                                                                                        // document.getElementById('slink').insertBefore(lspan, null);
                                                                                                                    });
                                                                                                            })  
                                                                                                    })
                                                                                                              
                                                                                            })                                                                                                              
                                                                                    })                                                                                                    
                                                                            })                                                                                              
                                                                    // })          
                                                            })

                                                        


                                            })
                                    })
                        })
                })
        })
}

function upload() {
    // window.location = 'home.html';
    // publicId = document.getElementById("publicid").value;
    // serviceId = document.getElementById("service").value;

    let appToken = localStorage.getItem("appToken");
    // let mdHandle = localStorage.getItem("mdHandle");
    // let hashedString = localStorage.getItem("hashedString");
    let username = localStorage.getItem("username");
    let publicId = "smartjuice";
    let serviceId = "images";

    let mdHandle, permsHandle, permSetHandle, entriesHandle, signKeyHandle, nfsHandle, fileHandle;

    window.safeMutableData.newRandomPublic(appToken, 15002)
      .then((res) => {
      	mdHandle = res;
        log('Returns handle to newly created, public, randomly named MutableData structure: ' + res);
      })
      .then(() => {
        window.safeMutableData.newPermissions(appToken)
            .then((res) => {
                permsHandle = res;
                log('Newly created permissions handle returned: ' + res);
            })
            .then(() => {
                window.safeMutableData.newPermissionSet(appToken)
                    .then((res) => {
                        permSetHandle = res;
                        log('Returns newly created PermissionsSet handle: ' + res);
                    })
                    .then(() => {
                        window.safeMutableData.newEntries(appToken)
                            .then((res) => {
                                entriesHandle = res;
                                log('Returns an entries handle to be used with safeMutableDataEntries functions: ' + res);
                            })
                            .then(() => {
                                    window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Insert")
                                        .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Update"))
                                        .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Delete"))     
                                        .then(() => {
                                            window.safeCrypto.getAppPubSignKey(appToken)
                                                .then((res) => {
                                                    signKeyHandle = res;
                                                    log('Returns applications public signing key: ' + res);
                                                })
                                                .then(() => {
                                                        window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permSetHandle)
                                                            .then(_ => {
                                                                log('Finished inserting new permissions');
                                                            })
                                                            .then(() => {
                                                                window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
                                                                    .then(_ => {
                                                                        log('Finished creating and committing MutableData to the network');
                                                                    })
                                                                    .then(() => {
                                                                        window.safeMutableData.emulateAs(mdHandle, 'NFS')
                                                                            .then((res) => {
                                                                                nfsHandle = res;
                                                                                log('Returns nfsHandle: ' + res);
                                                                            })
                                                                            .then(() => {
                                                                                // let fileContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>SAFE web site</title></head><body>SAFE web site</body></html>';
                                                                                    console.log(fileContent);
                                                                                    window.safeNfs.create(nfsHandle, fileContent)
                                                                                    .then((res) => {
                                                                                        fileHandle = res;
                                                                                        log('Returns the file handle of a newly created file: ' + res);
                                                                                    })
                                                                                    .catch((err) => {
                                                                                        console.log(err);
                                                                                    })
                                                                                    .then(() => {
                                                                                        //  let fileName = 'profile.png';
                                                                                            window.safeNfs.insert(nfsHandle, fileHandle, fileName)
                                                                                            .then(res => {
                                                                                                fileHandle = res;
                                                                                                log('Returns same fileHandle: ' + res);
                                                                                            })
                                                                                            .then(() => {
                                                                                                window.safeMutableData.getNameAndTag(mdHandle)
                                                                                                    .then((res) => {
                                                                                                        mdName = res.name.buffer;
                                                                                                        log('Name: ' + String.fromCharCode.apply(null, new Uint8Array(res.name.buffer)) + ', Tag: ' + res.tag);
                                                                                                    })
                                                                                                    .then(() => {
                                                                                                        var newMD = "profile_" + username;
                                                                                                        window.safeCrypto.sha3Hash(appToken, publicId)
                                                                                                            .then((res) => {
                                                                                                                hashedString = res;
                                                                                                                log('SHA3 Hash generated: ', String.fromCharCode.apply(null, new Uint8Array(res)));
                                                                                                            })
                                                                                                            .then(() => {
                                                                                                                window.safeMutableData.newPublic(appToken, hashedString, 15001)
                                                                                                                    .then((res) => {
                                                                                                                        mdHandle = res;
                                                                                                                        log('Returns handle to newly created or already existing, public, explicitly named Mutable Data structure: ' + res);
                                                                                                                    })
                                                                                                                    .then(() => {
                                                                                                                        window.safeMutableData.newPermissions(appToken)
                                                                                                                            .then((res) => {
                                                                                                                                permsHandle = res;
                                                                                                                                log('Newly created permissions handle returned: ' + res);
                                                                                                                            })
                                                                                                                            .then(() => {
                                                                                                                                window.safeMutableData.newPermissionSet(appToken)
                                                                                                                                    .then((res) => {
                                                                                                                                        permSetHandle = res;
                                                                                                                                        log('Returns newly created PermissionsSet handle: ' + res);
                                                                                                                                    })
                                                                                                                                    .then(() => {
                                                                                                                                        window.safeMutableData.newEntries(appToken)
                                                                                                                                            .then((res) => {
                                                                                                                                                entriesHandle = res;
                                                                                                                                                log('Returns an entries handle to be used with safeMutableDataEntries functions: ' + res);
                                                                                                                                            })
                                                                                                                                            .then(() => {
                                                                                                                                                    window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Insert")
                                                                                                                                                        .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Update"))
                                                                                                                                                        .then(() => window.safeMutableDataPermissionsSet.setAllow(permSetHandle, "Delete"))     
                                                                                                                                                        .then(() => {
                                                                                                                                                            window.safeCrypto.getAppPubSignKey(appToken)
                                                                                                                                                                .then((res) => {
                                                                                                                                                                    signKeyHandle = res;
                                                                                                                                                                    log('Returns applications public signing key: ' + res);
                                                                                                                                                                })
                                                                                                                                                                .then(() => {
                                                                                                                                                                        window.safeMutableDataPermissions.insertPermissionsSet(permsHandle, signKeyHandle, permSetHandle)
                                                                                                                                                                            .then(_ => {
                                                                                                                                                                                log('Finished inserting new permissions');
                                                                                                                                                                            })
                                                                                                                                                                            .then(() => {
                                                                                                                                                                                window.safeMutableDataEntries.insert(entriesHandle, serviceId, mdName)
                                                                                                                                                                                    .then(_ => log('New entry inserted'))
                                                                                                                                                                                    .then(() => {
                                                                                                                                                                                        window.safeMutableData.put(mdHandle, permsHandle, entriesHandle)
                                                                                                                                                                                            .then(_ => {
                                                                                                                                                                                                log('Finished creating and committing MutableData to the network');
                                                                                                                                                                                                alert('File Saved on Safe Network: '+fileName);
                                                                                                                                                                                                var fileUrl = 'safe://' + serviceId + '.' + publicId +'/' + fileName;
                                                                                                                                                                                                console.log(fileUrl);
                                                                                                                                                                                                fetch_file();
                                                                                                                                                                                                // var lspan = document.createElement('span');
                                                                                                                                                                                                // lspan.innerHTML = ['Safe URL for the uploaded file : <a class="btn btn-lg btn-info" href="', fileUrl,'" target="_blank">', fileUrl, '</a>'].join('');
                                                                                                                                                                                                // document.getElementById('slink').insertBefore(lspan, null);
                                                                                                                                                                                            })
                                                                                                                                                                                            .then(() => {
    let container = '_publicNames';
    window.safeApp.getContainer(appHandle, container)
        .then((res) => {
            mdHandle = res;
            log('Returns handle to Mutable Data behind ' + container + ' container: ' + res);
        })
        .then(() => {
            window.safeMutableData.newMutation(appHandle)
                .then((res) => {
                    mutationHandle = res;
                    log('Returns handle to be able to call safeMutableDataMutation functions: ' + res);
                })
                .then(() => {
                    window.safeMutableData.encryptKey(mdHandle, publicId)
                        .then((res) => {
                            encryptedKey = res;
                            log('Encrypted key: ' + res);
                        })
                        .then(() => {
                            window.safeMutableData.encryptValue(mdHandle, hashedString)
                                .then((res) => {
                                    encryptedValue = res;
                                    log('Encrypted value: ' + res);
                                })
                                .then(() => {
                                   window.safeMutableDataMutation.insert(mutationHandle, encryptedKey, encryptedValue)
                                        .then(_ => {
                                            log('Registers an insert operation with mutation handle, later to be applied.');

                                            // You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes.
                                        })
                                        .then(() => {
                                            window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle)
                                                .then(_ => {
                                                    log('New entry was inserted in the MutableData and committed to the network');
                                                })
                                                .then(() => {
                                                    let container = '_public';
                                                    window.safeApp.getContainer(appHandle, container)
                                                    .then((res) => {
                                                        mdHandle = res;
                                                        log('Returns handle to Mutable Data behind ' + container + ' container: ' + res);
                                                    })
                                                    .then(() => {
                                                        window.safeMutableData.newMutation(appHandle)
                                                            .then((res) => {
                                                                mutationHandle = res;
                                                                log('Returns handle to be able to call safeMutableDataMutation functions: ' + res);
                                                            })
                                                            .then(() => {
                                                                var urlvalue = '_public/'+publicId+'/'+serviceId+'-root';
                                                                window.safeMutableDataMutation.insert(mutationHandle, urlvalue, mdName)
                                                                    .then(_ => {
                                                                        log('Registers an insert operation with mutation handle, later to be applied.');

                                                                        // You must now run safeMutableData.applyEntriesMutation(mdHandle, mutationHandle) to save changes.
                                                                    })
                                                                    .then(() => {
                                                                        window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle)
                                                                            .then(_ => {
                                                                                return 'New entry was inserted in the MutableData and committed to the network';
                                                                            });
                                                                    })
                                                            })
                                                    })
                                                })
                                        })
                                })
                        })
                })
        })
                                                                                                                                                                                            })
                                                                                                                                                                                    })  
                                                                                                                                                                            })
                                                                                                                                                                })
                                                                                                                                                        })
                                                                                                                                            })
                                                                                                                                    })
                                                                                                                            })
                                                                                                                    })
                                                                                                            })
                                                                                                    })          
                                                                                            })                                                                                                              
                                                                                    })                                                                                                    
                                                                            })                                                                                              
                                                                    })          
                                                            })
                                                    })                                                          
                                        })                                                     
                                })                                                   
                    })
            })
      })
}


function fetch_file() {
    var serviceId = "avatar";
    var publicId = "profile_" + localStorage.getItem("username");
    var appToken = localStorage.getItem("appToken");
    var fileUrl = 'safe://' + serviceId + '.' + publicId +'/' + fileName;
    window.safeApp.webFetch(
            appToken,
            fileUrl // the SAFE Network URL
        )
        .then((data) => {
            // var link = window.URL.createObjectURL(data);
            // console.log(String.fromCharCode.apply(null, new Uint8Array(data)));
            // log(String.fromCharCode.apply(null, new Uint8Array(data)));
            // Render thumbnail.
            // console.log(link);
            // Render thumbnail.
          var file = new File([data], 'filename', {type: 'contentType', lastModified: Date.now()});
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', URL.createObjectURL(file),
                            '" title="', escape(fileName), '"/>'].join('');
          document.getElementById('pic').insertBefore(span, null);
        });
}

function del_file() {

}

function handleFileSelect(evt) {
    var file = evt.target.files[0];
    fileName = file.name;
    console.log("name : " + file.name);
    console.log("size : " + file.size);
    console.log("type : " + file.type);
    console.log("date : " + file.lastModified);

    //   // Only process image files.
    //   if (!file.type.match('image.*')) {
    //     continue;
    //   }

      var reader = new FileReader();

      // Closure to capture the file information.
    //   reader.onload = (function(theFile) {
    //     return function(e) {
    //       // Render thumbnail.
    //       var span = document.createElement('span');
    //       span.innerHTML = ['<img class="thumb" src="', e.target.result,
    //                         '" title="', escape(theFile.name), '"/>'].join('');
    //       document.getElementById('list').insertBefore(span, null);
    //     };
    //   })(file);

// reader.onload = function(event) {
//     content = new Buffer(event.target.result.byteLength);
//     var view = new Uint8Array(event.target.result);
//     for (var i = 0; i < content.length; ++i) {
//         content[i] = view[i];
//     }
//     return content;
// };

 // If we use onloadend, we need to check the readyState.
    reader.onloadend = (function(theFile) {
        return function(evt) {
          // Render thumbnail.
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                // document.getElementById('byte_content').textContent = evt.target.result;  
                var content = new Buffer(event.target.result.byteLength);
                var view = new Uint8Array(event.target.result);
                for (var i = 0; i < content.length; ++i) {
                    content[i] = view[i];
                }
                fileContent = content;    
            }
        };
      })(file);

      // Read in the image file as a data URL.
    //   reader.readAsDataURL(file);
    //   reader.readAsBinaryString(file);
      reader.readAsArrayBuffer(file);
      
     
  }

function log(data) {
    // alert(data);
    console.log(data);
    // var tstamp = (new Date).toISOString().replace(/z|t/gi,' ').trim();
    // var el = document.getElementById('sadelog').value;
    // el = el + "\n" + tstamp + ': ' + data + "\n";
    // document.getElementById('sadelog').value = el;    
}

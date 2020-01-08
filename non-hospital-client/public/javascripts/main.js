    function login(event) {
    event.preventDefault();
    const p_key = document.getElementById("privateKey").value;
      $.post(
        "/login",
        { pri_key: p_key.trim() },
        (data, textStatus, jqXHR) => {
          if (data.done == 1) {
            sessionStorage.clear();
            sessionStorage.setItem("privatekey", data.privatekey);
            alert(data.message);
            window.location.href = "/mainView";
          } else {
            alert("UnSuccessful Login");
            window.location.href = "/";
          }
        },
        "json"
      );
    }
  
  function logout(event) {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = "/";
  }

  function addHospital(event){
    event.preventDefault();
    const id = document.getElementById("id").value;
    const regNo = document.getElementById("regNo").value;
    const hospitalName = document.getElementById("hospitalName").value;
    const address = document.getElementById("address").value;
    const contactNo = document.getElementById("contactNo").value;
    $.post(
      "/add",
      {
        id ,
        regNo ,
        hospitalName,
        address,
        contactNo
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
        console.log("-----------",data)
    
        window.location.href = "/mainView";
      },
      "json"
    );
  }

  function updateHospital(event){
    event.preventDefault();
    const id = document.getElementById("id").value;
    const regNo = document.getElementById("regNo").value;
    const hospitalName = document.getElementById("hospitalName").value;
    const address = document.getElementById("address").value;
    const contactNo = document.getElementById("contactNo").value;
    $.post(
      "/update",
      {
        id ,
        regNo ,
        hospitalName,
        address,
        contactNo
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);    
        window.location.href = "/mainView";
      },
      "json"
    );
  }

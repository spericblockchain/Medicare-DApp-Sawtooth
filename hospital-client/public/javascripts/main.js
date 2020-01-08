
function login(event) {
    event.preventDefault();
    const p_key = document.getElementById("privateKey").value;
    $.post(
      "/login",
      { pri_key: p_key.trim() },
      (data, textStatus, jqXHR) => {
      console.log("TCL: login -> data", data)
        
        if (data.done == 1) {
          sessionStorage.clear();
          sessionStorage.setItem("privatekey", data.privatekey);
          sessionStorage.setItem("address", data.hospData.address);
          sessionStorage.setItem("contactNo", data.hospData.contactNo);
          sessionStorage.setItem("hospitalName", data.hospData.hospitalName);
          sessionStorage.setItem("publickey", data.hospData.publickey);
          sessionStorage.setItem("registerNo", data.hospData.registerNo);
          alert(data.message);
          window.location.href = "/mainView";
        } else {
          alert(data.message);
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

  function viewData(event){
    event.preventDefault();
    const key = sessionStorage.getItem("privatekey");
    $.post(
      "/view",
      { key },
      (data, textStatus, jqXHR) => {
        let tablerow = ""
        const key = sessionStorage.getItem("privatekey");
        let doctors = data.doctors
        console.log("TCL: viewData -> doctors", doctors)
        console.log("TCL: viewData -> doctors", doctors[0].doctorName)
        for(let i =0;i< doctors.length;i++){
          let add = doctors[i].hospitalStateAddress;
          console.log("TCL: viewData -> add", add)
          updateButton = "<td><a href='/viewed?address="+add+"&key="+key+"'>Update</a></td>"
          deleteButton = "<td><a href='/delete?address="+add+"&key="+key+"'>Delete</a></td>"
         tablerow = '<tr id = tr'+ i + '>'+ '<td>'+ doctors[i].doctorName + '</td>' + '<td>'+doctors[i].hospitalName + '</td>' + '<td>'+doctors[i].department + '</td>' + '<td>'+doctors[i].registerNo + '</td>' + '<td>'+doctors[i].contactNo + '</td>'+ '<td>'+doctors[i].rating + '</td>' + updateButton + deleteButton + '</tr>'
          $('#doctors tr:last').after(tablerow);
        }
      // window.location.href = "/doctorAdd";
      },
      "json"
    );
  }

  function addDoctor(event){
    event.preventDefault();
    const id = document.getElementById("id").value,
    regNo = document.getElementById("regNo").value,
    doctorName = document.getElementById("doctorName").value,
    area = document.getElementById("area").value,
    contactNo = document.getElementById("contactNo").value,
    hospitalName = sessionStorage.getItem("hospitalName");
    key = sessionStorage.getItem("privatekey");

    $.post(
      "/add",
      {
        id ,
        regNo ,
        doctorName,
        area,
        contactNo,
        hospitalName,
        key
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
        window.location.href = "/mainView";
      },
      "json"
    );
  }

  function updateDoctor(event){
    event.preventDefault();
    const id = document.getElementById("id").value;
    const regNo = document.getElementById("regNo").value;
    const doctorName = document.getElementById("doctorName").value;
    const area = document.getElementById("area").value;
    const hospitalName = document.getElementById("hospitalName").value;
    const contactNo = document.getElementById("contactNo").value;
    const key = sessionStorage.getItem("privatekey");
    const report = sessionStorage.getItem("reports");
    $.post(
      "/update",
      {
        id ,
        regNo ,
        doctorName,
        area,
        hospitalName,
        contactNo,
        key
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);    
        window.location.href = "/mainView";
      },
      "json"
    );
  }

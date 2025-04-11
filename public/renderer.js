


document.addEventListener("DOMContentLoaded", () => {
  // 使用 FileReader 解析 CSV 文件，转换成对象数组
  function loadCSV(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const csvText = event.target.result;
      const records = parseCSV(csvText);
      renderTable(records);
      // 保存 CSV 已加载标记，下次可自动加载（也可保存文件路径以便重载）
      localStorage.setItem("csvLoaded", "true");
    };
    reader.readAsText(file, "UTF-8");
  }

  // 简单的 CSV 解析（这里假设 CSV 文件分隔符为逗号，并且第一行为表头）
  function parseCSV(text) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  }
  let dataList;
  let videpath;

  // 根据 CSV 数据对象数组渲染表格
  function renderTable(records) {


    dataList = records;
    console.log("renderTable:", dataList);

    const tbody = document.querySelector("#accountTable tbody");
    tbody.innerHTML = "";
    records.forEach(record => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
         <td>${record.ID || ""}</td>
         <td>${record.IP || ""}</td>
         <td>${record.Port || ""}</td>
         <td>${record.Username || ""}</td>
         <td>${record.Password || ""}</td>
         <td>${record.TK_Username || ""}</td>
         <td>${record.TK_Password || ""}</td>
         <td>
            <button class="manualOpenBtn" data-id="${record.ID}">手动打开</button>
            <button class="verifyBtn" data-id="${record.ID}">验证</button>
         </td>
      `;
      tbody.appendChild(tr);
    });
    bindTableButtons();
  }

  // 绑定每行操作按钮的点击事件
  function bindTableButtons() {
    document.querySelectorAll(".manualOpenBtn").forEach(button => {
      button.addEventListener("click", () => {
        const row = button.closest("tr");
      // 获取所有数据单元格（假设第一列到第七列为数据）
      const cells = row.querySelectorAll("td");
      const data = {
        "ID": cells[0].textContent.trim(),
        "IP": cells[1].textContent.trim(),
        "Port": cells[2].textContent.trim(),
        "Username": cells[3].textContent.trim(),
        "Password": cells[4].textContent.trim(),
        "TK_Username": cells[5].textContent.trim(),
        "TK_Password": cells[6].textContent.trim()
      };

      console.log('datadata:', data);
      // 将数据转换为 JSON 格式字符串并输出
      const jsonStr = JSON.stringify(data);
       window.api.open(data);

      });
    });

    document.querySelectorAll(".verifyBtn").forEach(button => {
      button.addEventListener("click", () => {
        const row = button.closest("tr");
        // 获取所有数据单元格（假设第一列到第七列为数据）
        const cells = row.querySelectorAll("td");
        const data = {
          "ID": cells[0].textContent.trim(),
          "IP": cells[1].textContent.trim(),
          "Port": cells[2].textContent.trim(),
          "Username": cells[3].textContent.trim(),
          "Password": cells[4].textContent.trim(),
          "TK_Username": cells[5].textContent.trim(),
          "TK_Password": cells[6].textContent.trim()
        };
        window.api.verify(data);
      });
    });
  }

  // CSV 打开按钮事件，使用隐藏的文件选择元素
  const openCSVBtn = document.getElementById("openCSVBtn");
  openCSVBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
         loadCSV(file);
      }
    };
    input.click();
  });

  // 视频上传按钮事件：调用窗口 API 打开文件夹选择（需主进程提供 openVideoFolder 接口）
  const uploadVideoBtn = document.getElementById("uploadVideoBtn");
  uploadVideoBtn.addEventListener("click", () => {
        window.api.openVideoFolder()
      .then(folderPath => {
         if (folderPath) {

           alert("选择的视频上传文件夹：" + folderPath);
           // 可在这里进一步处理文件夹中的视频文件上传逻辑
           videpath = folderPath;
         }
      })
      .catch(err => console.error("视频上传错误：", err));
  });


  const startBot = document.getElementById("startBot");
  startBot.addEventListener("click", () => {
      if(!dataList)
      {
        alert("请选择账号VSV" );
        return;
      }
      window.api.openF(videpath, dataList);
  
  });


  // 启动时检查是否上次已加载 CSV（根据 localStorage 记录，可扩展为从本地存储中读取 CSV 文件内容）
  if (localStorage.getItem("csvLoaded") === "true") {
    // 此处可自动调用相关 API 或重新加载 CSV 数据
    // 例如：window.api.getLastCSVFilePath() 然后自动加载文件
    console.log("上次已加载 CSV，自动进入打开状态");
    // 注：具体实现方式取决于你如何保存 CSV 文件路径或内容
  }
});

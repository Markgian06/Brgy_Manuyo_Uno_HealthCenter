function showAlert(message, type = "error", targetId = "formAlert") {
    const alertElement = document.getElementById(targetId);

    if (alertElement) {
        clearAlert(targetId);

        alertElement.innerHTML = `
            ${message} 
            <button class="alert-close" onclick="clearAlert('${targetId}')">&times;</button>
        `;
        alertElement.className = `alert ${type}`;

        const duration = type === "success" ? 5000 : 3000;

        setTimeout(() => clearAlert(targetId), duration);
    }
}

function clearAlert(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.innerHTML = "";
        target.className = "";
    }
}

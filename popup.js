document.getElementById('export').addEventListener('click', () => {
    // Code to generate export data
    const exportData = JSON.stringify({ /* your extension state */ });
    document.getElementById('exportData').value = btoa(exportData);
    document.getElementById('exportModal').classList.add('active');
});

document.getElementById('import').addEventListener('click', () => {
    document.getElementById('importModal').classList.add('active');
});

document.getElementById('copyExport').addEventListener('click', () => {
    const exportData = document.getElementById('exportData');
    exportData.select();
    document.execCommand('copy');
});

document.getElementById('importProgress').addEventListener('click', () => {
    const importData = document.getElementById('importData').value;
    const decodedData = atob(importData);
    // Code to import progress
});

document.getElementById('closeExport').addEventListener('click', () => {
    document.getElementById('exportModal').classList.remove('active');
});

document.getElementById('closeImport').addEventListener('click', () => {
    document.getElementById('importModal').classList.remove('active');
});

const challengeItems = document.querySelectorAll('.challenge-item');
challengeItems.forEach(item => {
    item.addEventListener('click', () => {
        // Code to handle challenge selection and reset progress
    });
});
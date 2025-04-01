// Variables para manejar extras
let extrasCount = 0;
const extras = [];

// Funciones para cambiar de página
function showPage(pageId) {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('presupuesto-page').classList.add('hidden');
    document.getElementById('recibo-page').classList.add('hidden');
    
    document.getElementById(pageId).classList.remove('hidden');
}

// Establecer la fecha actual en los campos fecha
function setFechaActual() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    document.getElementById('presupuesto-fecha').value = formattedDate;
    document.getElementById('recibo-fecha').value = formattedDate;
}

// Agregar un extra
function agregarExtra() {
    extrasCount++;
    const extraId = `extra-${extrasCount}`;
    
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-item';
    extraDiv.id = extraId;
    extraDiv.innerHTML = `
        <div class="form-group">
            <label for="${extraId}-desc">Descripción:</label>
            <input type="text" id="${extraId}-desc" placeholder="Descripción del extra" class="extra-descripcion">
        </div>
        <div class="form-group">
            <label for="${extraId}-importe">Importe:</label>
            <div class="amount-input">
                <input type="number" id="${extraId}-importe" placeholder="0" min="0" class="extra-importe" oninput="calcularTotalPresupuesto()">
            </div>
        </div>
        <div class="extra-controls">
            <button type="button" class="btn-remove-extra" onclick="eliminarExtra('${extraId}')">×</button>
        </div>
    `;
    
    document.getElementById('extras-container').appendChild(extraDiv);
    extras.push(extraId);
}

// Eliminar un extra
function eliminarExtra(extraId) {
    const extraElement = document.getElementById(extraId);
    if (extraElement) {
        extraElement.remove();
        
        // Eliminar del array
        const index = extras.indexOf(extraId);
        if (index > -1) {
            extras.splice(index, 1);
        }
        
        calcularTotalPresupuesto();
    }
}

// Calcular el total del presupuesto
function calcularTotalPresupuesto() {
    const importe = parseFloat(document.getElementById('presupuesto-importe').value) || 0;
    
    // Sumar todos los extras
    let totalExtras = 0;
    extras.forEach(extraId => {
        const extraImporte = document.getElementById(`${extraId}-importe`);
        if (extraImporte) {
            totalExtras += parseFloat(extraImporte.value) || 0;
        }
    });
    
    const total = importe + totalExtras;
    
    document.getElementById('presupuesto-total').textContent = `$${total.toLocaleString()}`;
}

// Formatear un número como moneda
function formatCurrency(value) {
    const number = parseFloat(value) || 0;
    return `$${number.toLocaleString()}`;
}

// Generar PDF de Presupuesto
function generarPDFPresupuesto() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Obtener los valores del formulario
   const fecha = document.getElementById('presupuesto-fecha').value;
    const cliente = document.getElementById('presupuesto-cliente').value || 'Cliente';
    const evento = document.getElementById('presupuesto-evento').value;
    const salon = document.getElementById('presupuesto-salon').value;
    //const fechaEvento = document.getElementById('presupuesto-fecha-evento').value;
    const detalles = document.getElementById('presupuesto-detalles').value;
    const importe = parseFloat(document.getElementById('presupuesto-importe').value) || 0;
    const extrasContainer = document.getElementById('extras-container');
    const extraItems = extrasContainer.querySelectorAll('.extra-item');
    
    // Agregar los extras al PDF
    let totalExtras = 0;
    const extras = [];
    extraItems.forEach(item => {
        const desc = item.querySelector('.extra-descripcion').value;
        const valor = parseFloat(item.querySelector('.extra-importe').value) || 0;
        totalExtras += valor;
        extras.push({ desc, valor });
    });
    
    const total = importe + totalExtras;

    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("JARA DJ's GROUP", 20, 20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Dj's, Sonido e Iluminación", 20, 30);

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.text('PRESUPUESTO', 20, 50);
    doc.setDrawColor(18, 18, 18);
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    doc.setFontSize(12);
    doc.text(`Fecha: ${formatDate(fecha)}`, 20, 65);
    doc.text(`Cliente: ${cliente}`, 20, 75);
    doc.text(`Evento: ${evento}`, 20, 85);
    doc.text(`Salón: ${salon}`, 20, 95);
    //doc.text(`Fecha del evento: ${formatDate(fechaEvento)}`, 20, 105);

    let y = 120;
    doc.setFillColor(230, 230, 230);
    doc.rect(20, y - 10, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('DETALLES', 25, y - 3);

    const detalleTexto = detalles.trim();
    const lines = doc.splitTextToSize(detalleTexto, 160);
    doc.text(lines, 25, y + 8);
    y += lines.length * 7 + 15;

    if (extras.length > 0) {
        doc.setFillColor(230, 230, 230);
        doc.rect(20, y, 170, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text('EXTRAS', 25, y + 7);
        y += 15;
        extras.forEach(extra => {
            doc.text(`- ${extra.desc}: $${formatearNumero(extra.valor)}`, 25, y);
            y += 8;
        });
    }

    y += 10;
    doc.setFillColor(18, 18, 18);
    doc.rect(20, y, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${formatearNumero(total)}`, 25, y + 8);

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(10);
    doc.text("Jara Dj's Group", 20, y + 30);
    doc.text('Tel: 261-000-0000', 20, y + 35);

    try {
        const pdfOutput = doc.output('blob');
        const file = new File([pdfOutput], `Presupuesto_${cliente}_${formatDateFile(fecha)}.pdf`, { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (isMobile()) {
            setTimeout(() => {
                if (navigator.share) {
                    navigator.share({
                        files: [file],
                        title: file.name
                    }).catch(err => console.log('Compartir cancelado o fallido:', err));
                }
            }, 1000);
        }

    } catch (err) {
        console.error('Error al generar el PDF:', err);
        alert('Hubo un error al generar el PDF.');
    }
}

    

// Generar PDF de Recibo
function generarPDFRecibo() {
const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fecha = document.getElementById('recibo-fecha').value;
    const cliente = document.getElementById('recibo-cliente').value || 'Cliente';
    const evento = document.getElementById('recibo-evento').value;
    const salon = document.getElementById('recibo-salon').value;
    const detalle = document.getElementById('recibo-detalle').value;
    const importe = parseFloat(document.getElementById('recibo-importe').value) || 0;

    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("JARA DJ's GROUP", 20, 20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Dj's, Sonido e Iluminación", 20, 30);

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.text('RECIBO', 20, 50);
    doc.setDrawColor(18, 18, 18);
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    doc.setFontSize(12);
    doc.text(`Fecha: ${formatDate(fecha)}`, 20, 65);
    doc.text(`Cliente: ${cliente}`, 20, 75);
    doc.text(`Evento: ${evento}`, 20, 85);
    doc.text(`Salón: ${salon}`, 20, 95);

    let y = 110;
    doc.setFillColor(230, 230, 230);
    doc.rect(20, y - 10, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('DETALLE', 25, y - 3);

    const detalleTexto = detalle.trim();
    const lines = doc.splitTextToSize(detalleTexto, 160);
    doc.text(lines, 25, y + 8);
    y += lines.length * 7 + 15;

    y += 10;
    doc.setFillColor(18, 18, 18);
    doc.rect(20, y, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`TOTAL RECIBIDO: $${formatearNumero(importe)}`, 25, y + 8);

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(10);
    doc.text("Jara Dj's Group", 20, y + 30);
    doc.text('Tel: 261-000-0000', 20, y + 35);

    try {
        const pdfOutput = doc.output('blob');
        const file = new File([pdfOutput], `Recibo_${cliente}_${formatDateFile(fecha)}.pdf`, { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (isMobile()) {
            setTimeout(() => {
                if (navigator.share) {
                    navigator.share({
                        files: [file],
                        title: file.name
                    }).catch(err => console.log('Compartir cancelado o fallido:', err));
                }
            }, 1000);
        }

    } catch (err) {
        console.error('Error al generar el PDF:', err);
        alert('Hubo un error al generar el PDF.');
    }
}
// Función para generar PDF usando html2canvas y jsPDF
// Función optimizada para generar PDF
// Función optimizada para generar PDF
function generatePDF(elementId, filename) {
    const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
        
            // Obtener los datos del formulario (como en HOMOLA)
            const fecha = document.getElementById('presupuesto-fecha').value;
            const cliente = document.getElementById('presupuesto-cliente').value || 'Cliente';
            const evento = document.getElementById('presupuesto-evento').value;
            const salon = document.getElementById('presupuesto-salon').value;
            //const fechaEvento = document.getElementById('presupuesto-fecha-evento').value;
            const detalles = document.getElementById('presupuesto-detalles').value;
            const importe = parseFloat(document.getElementById('presupuesto-importe').value) || 0;
            const extrasContainer = document.getElementById('extras-container');
            const extraItems = extrasContainer.querySelectorAll('.extra-item');
        
            let totalExtras = 0;
            const extras = [];
        
            extraItems.forEach(item => {
                const desc = item.querySelector('.extra-descripcion').value;
                const valor = parseFloat(item.querySelector('.extra-importe').value) || 0;
                totalExtras += valor;
                extras.push({ desc, valor });
            });
        
            const total = importe + totalExtras;
        
            // Encabezado visual
            doc.setFillColor(18, 18, 18);
            doc.rect(0, 0, 210, 40, 'F');
        
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.text("JARA DJ's GROUP", 20, 20);
            doc.setFontSize(16);
            doc.setFont("helvetica", "normal");
            doc.text("Dj's, Sonido e Iluminación", 20, 30);
        
            // Info del documento
            doc.setTextColor(44, 62, 80);
            doc.setFontSize(14);
            doc.text('PRESUPUESTO', 20, 50);
        
            doc.setDrawColor(52, 152, 219);
            doc.setLineWidth(0.5);
            doc.line(20, 55, 190, 55);
        
            doc.setFontSize(12);
            doc.text(`Fecha: ${formatDate(fecha)}`, 20, 65);
            doc.text(`Cliente: ${cliente}`, 20, 75);
            doc.text(`Evento: ${evento}`, 20, 85);
            doc.text(`Salón: ${salon}`, 20, 95);
            doc.text(`Fecha del evento: ${formatDate(fechaEvento)}`, 20, 105);
        
            // Detalles
            let y = 120;
            doc.setFillColor(230, 230, 230);
            doc.rect(20, y - 10, 170, 10, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('DETALLES', 25, y - 2);
        
            const detalleTexto = detalles.trim();
            const lines = doc.splitTextToSize(detalleTexto, 160);
            doc.text(lines, 25, y + 8);
            y += lines.length * 7 + 15;
        
            // Extras
            if (extras.length > 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(20, y, 170, 10, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text('EXTRAS', 25, y + 7);
                y += 15;
        
                extras.forEach(extra => {
                    doc.text(`- ${extra.desc}: $${formatearNumero(extra.valor)}`, 25, y);
                    y += 8;
                });
            }
        
            // Total
            y += 10;
            doc.setFillColor(52, 152, 219);
            doc.rect(20, y, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text(`TOTAL: $${formatearNumero(total)}`, 25, y + 9);
        
            // Pie de página
            doc.setTextColor(128, 128, 128);
            doc.setFontSize(10);
            doc.text('Jara Dj\'s Group', 20, y + 30);
            doc.text('Tel: 261-000-0000', 20, y + 35);
        
            try {
                const pdfOutput = doc.output('blob');
                const file = new File([pdfOutput], `Presupuesto_${cliente}_${formatDateFile(fecha)}.pdf`, { type: 'application/pdf' });
        
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
        
                if (isMobile()) {
                    setTimeout(() => {
                        if (navigator.share) {
                            navigator.share({
                                files: [file],
                                title: file.name
                            }).catch(err => console.log('Compartir cancelado o fallido:', err));
                        }
                    }, 1000);
                }
        
            } catch (err) {
                console.error('Error al generar el PDF:', err);
                alert('Hubo un error al generar el PDF.');
            }
        }

function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-AR');
        }
        
        function formatDateFile(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
        
        function formatearNumero(valor) {
            return Number(valor).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
        
        function isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }


        // Inicializar al cargar la página
        window.onload = function() {
            setFechaActual();
            // Agregar un extra por defecto
            agregarExtra();
        };

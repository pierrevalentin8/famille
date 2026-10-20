export async function makeCollectionWorkbook(lists, items, memberName, ownerNames = {}) {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Famille';
    const sheet = workbook.addWorksheet('Mes collections', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
        { header: 'Collection', key: 'collection', width: 26 }, { header: 'Genre', key: 'genre', width: 18 }, { header: 'Titre / exemplaire', key: 'title', width: 42 },
        { header: 'Auteur / créateur', key: 'creator', width: 28 }, { header: 'Quantité', key: 'quantity', width: 12 }, { header: 'Notes', key: 'notes', width: 55 }, { header: 'Membre', key: 'member', width: 24 }
    ];
    for (const c of lists) {
        const entries = items.filter(i => i.collectionId === c.id);
        for (const i of entries.length ? entries : [null])
            sheet.addRow({ collection: c.name, genre: c.genre, title: i?.title || '', creator: i?.creator || '', quantity: i?.quantity ?? '', notes: i?.notes || '', member: ownerNames[c.owner] || memberName });
    }
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF355A46' } };
    sheet.getRow(1).height = 26;
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, sheet.rowCount), column: 7 } };
    sheet.eachRow((row, n) => { row.alignment = { vertical: 'top', wrapText: true }; if (n > 1) {
        row.height = 32;
        if (n % 2 === 0)
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F3E8' } };
    } });
    return workbook.xlsx.writeBuffer();
}

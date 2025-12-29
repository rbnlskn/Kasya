import { AppState, Transaction, TransactionType, Wallet, Category } from '../types';

interface CSVRow {
  date: string;
  time?: string;
  type: string;
  amount: string;
  wallet: string;
  category: string;
  title?: string;
  description?: string;
}

interface ProcessedCSVResult {
    newTransactions: Transaction[];
    skippedCount: number;
    errorRows: { row: number, reason: string }[];
}


export const processCSVImport = (csvContent: string, currentAppState: AppState): ProcessedCSVResult => {
    const newTransactions: Transaction[] = [];
    let skippedCount = 0;
    const errorRows: { row: number, reason: string }[] = [];

    const lines = csvContent.split(/\r?\n/);
    if (lines.length < 2) {
        return { newTransactions, skippedCount: lines.length, errorRows: [{ row: 1, reason: "CSV file is empty or has no data rows."}] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    const walletsMap = new Map<string, Wallet>(
        currentAppState.wallets.map(w => [w.name.trim().toLowerCase(), w])
    );
    const categoriesMap = new Map<string, Category>(
        currentAppState.categories.map(c => [c.name.trim().toLowerCase(), c])
    );

    dataRows.forEach((line, index) => {
        const rowNumber = index + 2;
        if (!line.trim()) return;

        const values = line.split(',');
        const row: Partial<CSVRow> = headers.reduce((obj, header, i) => {
            if (header) {
                obj[header as keyof CSVRow] = values[i]?.trim();
            }
            return obj;
        }, {} as Partial<CSVRow>);


        // --- Validation and Sanitization ---
        if (!row.date || !row.type || !row.amount || !row.wallet || !row.category) {
            skippedCount++;
            errorRows.push({ row: rowNumber, reason: "Missing required columns (date, type, amount, wallet, category)." });
            return;
        }

        const sanitizedType = row.type.toUpperCase() as TransactionType;
        if (sanitizedType !== 'INCOME' && sanitizedType !== 'EXPENSE') {
            skippedCount++;
            errorRows.push({ row: rowNumber, reason: `Invalid transaction type: "${row.type}". Must be "Income" or "Expense".` });
            return;
        }

        const cleanedAmount = row.amount.replace(/[^0-9.-]/g, '');
        const amount = parseFloat(cleanedAmount);
        if (isNaN(amount)) {
            skippedCount++;
            errorRows.push({ row: rowNumber, reason: `Invalid amount: "${row.amount}".` });
            return;
        }

        // --- Date Parsing ---
        let parsedDate: Date;
        const dateTimeString = `${row.date} ${row.time || '00:00:00'}`;

        // Try ISO 8601-like format first (YYYY-MM-DD)
        if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}/)) {
            parsedDate = new Date(dateTimeString);
        }
        // Then try MM/DD/YYYY
        else if (dateTimeString.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
           const [datePart, timePart] = dateTimeString.split(' ');
           const [month, day, year] = datePart.split('/');
           const isoDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '00:00:00'}`;
           parsedDate = new Date(isoDateStr);
        } else {
             parsedDate = new Date(dateTimeString);
        }

        if (isNaN(parsedDate.getTime())) {
            skippedCount++;
            errorRows.push({ row: rowNumber, reason: `Invalid date format: "${row.date} ${row.time || ''}".` });
            return;
        }

        // --- ID Mapping ---
        const wallet = walletsMap.get(row.wallet.trim().toLowerCase());
        if (!wallet) {
            skippedCount++;
            errorRows.push({ row: rowNumber, reason: `Wallet not found: "${row.wallet}".` });
            return;
        }
        let walletId = wallet.id;

        let categoryId: string | undefined;
        const category = categoriesMap.get(row.category.trim().toLowerCase());
        if (category) {
            categoryId = category.id;
        } else {
            // Fallback logic
            categoryId = sanitizedType === 'INCOME' ? 'cat_inc_adj' : 'cat_exp_adj';
        }


        // --- Object Construction ---
        newTransactions.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            date: parsedDate.toISOString(),
            amount: amount,
            type: sanitizedType,
            walletId: walletId,
            categoryId: categoryId,
            title: row.title || "Imported Transaction",
            description: row.description || "",
        });
    });

    return { newTransactions, skippedCount, errorRows };
};

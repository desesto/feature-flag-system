// Konverterer ISO string dates fra API response til Date objekter
export function parseApiDates(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'string') {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        if (isoDateRegex.test(data)) {
            return new Date(data);
        }
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => parseApiDates(item));
    }

    if (typeof data === 'object') {
        const result: any = {};
        for (const key in data) {
            result[key] = parseApiDates(data[key]);
        }
        return result;
    }

    return data;
}

// Konverterer Date objekter til ISO strings før API request
export function serializeDates(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    if (data instanceof Date) {
        return data.toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeDates(item));
    }

    if (typeof data === 'object') {
        const result: any = {};
        for (const key in data) {
            result[key] = serializeDates(data[key]);
        }
        return result;
    }

    return data;
}

// Konverterer Date til datetime-local format (YYYY-MM-DDTHH:mm)
export function toLocalDatetimeString(date: Date | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

// Konverterer datetime-local string til Date objekt
export function fromLocalDatetimeString(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    return new Date(dateString);
}
// Konverterer en enkelt værdi til ISO string hvis det er en Date
export function toISOStringIfDate(value: any): any {
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}
export const HOUSEHOLDS = ['St Pierre', 'Picauset', 'Les Hittes'];
export const AVATARS = ['🌿', '🌻', '🐱', '🦊', '🌸', '🐻', '🌞', '🦋'];
export const STREAMING_PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Canal+', 'Apple TV+', 'Max', 'HBO Max', 'Paramount+', 'Peacock', 'Crunchyroll', 'YouTube Premium', 'Spotify', 'Deezer', 'Apple Music', 'Amazon Music', 'Autre'];
export function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
export function validBirthDate(value, today = dayKey(new Date())) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > today)
        return false;
    const d = new Date(value + 'T12:00:00Z');
    return !isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
}
export function birthdaysForYear(members, year) {
    return members.filter(m => m.birthDate && validBirthDate(m.birthDate) && year >= Number(m.birthDate.slice(0, 4))).map(m => {
        const age = year - Number(m.birthDate.slice(0, 4));
        const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        const suffix = m.birthDate.slice(5) === '02-29' && !leap ? '02-28' : m.birthDate.slice(5);
        return { id: 'birthday-' + m.id + '-' + year, title: '🎂 ' + m.name + ' · ' + age + ' ans', date: year + '-' + suffix, time: '', description: 'Anniversaire de ' + m.name + ' — ' + age + ' ans', author: m.id, birthday: true };
    });
}
export function needsProfile(m) { return !!m && (!m.name || !m.email || !m.birthDate || !HOUSEHOLDS.includes(m.household)); }
export function parseIds(value) { if (Array.isArray(value))
    return value.filter((id) => typeof id === 'string'); if (typeof value === 'string') {
    try {
        return parseIds(JSON.parse(value));
    }
    catch {
        return [];
    }
} return []; }
export function eventIncludesDate(event, date) { return event.date <= date && (event.endDate || event.date) >= date; }
export function overlapsMonth(event, month) { const first = dayKey(new Date(month.getFullYear(), month.getMonth(), 1)), last = dayKey(new Date(month.getFullYear(), month.getMonth() + 1, 0)); return event.date <= last && (event.endDate || event.date) >= first; }
export function eventDateLabel(event) { const format = (date) => new Date(date + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); return event.endDate && event.endDate !== event.date ? 'Du ' + format(event.date) + (event.time ? ' à ' + event.time : '') + ' au ' + format(event.endDate) + (event.endTime ? ' à ' + event.endTime : '') : format(event.date) + (event.time ? ' · ' + event.time + (event.endTime ? ' – ' + event.endTime : '') : ' · Toute la journée'); }
export function childrenBirthdays(children, year) { return birthdaysForYear(children.map(c => ({ ...c, bio: '', avatar: '🧒', city: '' })), year).map(e => ({ ...e, author: '', childIds: [e.id.slice(9, e.id.lastIndexOf('-'))] })); }
export function isAdult(member, today = dayKey(new Date())) { if (!validBirthDate(member.birthDate, today))
    return false; let age = Number(today.slice(0, 4)) - Number(member.birthDate.slice(0, 4)); if (today.slice(5) < member.birthDate.slice(5))
    age--; return age >= 18; }
export function isGiftCreator(gift, userId) { return (gift.creator || gift.owner) === userId; }
export function recurringEventsForYear(events, year) {
    return events.flatMap(e => {
        if (!e.recurring)
            return e.date <= year + '-12-31' && (e.endDate || e.date) >= year + '-01-01' ? [e] : [];
        const startYear = Number(e.date.slice(0, 4));
        if (year < startYear)
            return [];
        const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0), suffix = e.date.slice(5) === '02-29' && !leap ? '02-28' : e.date.slice(5), date = year + '-' + suffix;
        return [{ ...e, sourceDate: e.date, sourceEndDate: e.endDate, date, endDate: date, anniversaryYears: year - startYear }];
    });
}

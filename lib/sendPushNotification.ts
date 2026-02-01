export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string
) {
    if (!expoPushToken) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: expoPushToken,
            sound: 'default',
            title,
            body,
        }),
    });
}

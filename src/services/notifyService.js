import toast from 'react-hot-toast';

export const notifyHospital = async (hospitalId, severity, eta) => {
    try {
        const payload = { hospital_id: hospitalId, severity, eta };
        
        const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || "/api-ml";
        // Notify endpoint in backend
        const response = await fetch(`${ML_SERVICE_URL}/notify-hospital`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Hospital notification dispatched:", data);
            
            if (severity === 'HIGH' || severity === 'CRITICAL') {
                toast.success(`Priority Alert sent to Hospital (ID: ${hospitalId})`, {
                    icon: '🚨',
                    duration: 4000,
                });
            } else {
                toast.success(`Hospital notified. ETA: ${eta} mins`);
            }
            return data;
        } else {
            console.error("Failed to notify hospital");
        }
    } catch (e) {
        console.error("Notification Service Error:", e);
        // Fallback for simulation if backend is down
        console.log("Simulating Notification locally...");
        toast(`Mock Notification to Hospital ${hospitalId} (ETA: ${eta})`);
    }
    return null;
};

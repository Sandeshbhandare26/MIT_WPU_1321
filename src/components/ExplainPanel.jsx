import React from 'react';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ExplainPanel({ result }) {
    if (!result) return null;

    const { severity, explanations, heatmap, confidence } = result;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto mt-6 animate-fade-in border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-gray-700">
                <Activity className="text-blue-500" size={24} />
                <h3 className="text-xl font-bold dark:text-white">AI Explainability (SHAP)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">Detected Severity</p>
                        <div className="flex items-center gap-2">
                            {severity === 'HIGH' ? <AlertTriangle className="text-red-500" /> : <ShieldCheck className="text-green-500" />}
                            <span className={`font-bold text-lg ${severity === 'HIGH' ? 'text-red-600' : severity === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                                {severity}
                            </span>
                        </div>
                    </div>
                    
                    {confidence && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Confidence Score</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${confidence * 100}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 inline-block">{(confidence * 100).toFixed(1)}%</span>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Key Decision Factors:</p>
                        <ul className="space-y-2">
                            {explanations && explanations.map((reason, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm dark:text-gray-300">
                                    <span className="text-blue-500 font-bold">•</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Activation Heatmap</p>
                    {heatmap ? (
                        <img 
                            src={`data:image/png;base64,${heatmap}`} 
                            alt="AI Heatmap" 
                            className="rounded shadow-sm max-w-full h-auto object-cover"
                        />
                    ) : (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-40 rounded flex items-center justify-center text-gray-400 text-sm">
                            Generating heatmap...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

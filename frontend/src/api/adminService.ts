import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface LogAuditoriaResponse {
    id: number;
    adminId: number;
    adminNombre: string;
    accion: string;
    reporteId?: number;
    detalles: string;
    fechaAccion: string;
}

export const getAdminReports = async (params: {
    q?: string;
    categorias?: number[];
    tipo?: string;
    lugar?: string;
    start_date?: string;
    end_date?: string;
    estado?: string;
    page: number;
    size: number;
}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/reportes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            q: params.q,
            categorias: params.categorias && params.categorias.length > 0 ? params.categorias.join(',') : undefined,
            tipo: params.tipo,
            lugar: params.lugar,
            start_date: params.start_date,
            end_date: params.end_date,
            estado: params.estado,
            page: params.page,
            size: params.size,
        },
    });
    return response.data;
};

export const cambiarEstadoReporte = async (id: number, estado: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
        `${API_URL}/admin/reportes/${id}/estado`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const eliminarReporte = async (id: number, motivo: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/admin/reportes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { motivo },
    });
};

export const getAuditLogs = async (): Promise<LogAuditoriaResponse[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/auditoria`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

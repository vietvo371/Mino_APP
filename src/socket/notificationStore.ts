import { create } from 'zustand';

export type UINotification = {
    id: string;
    title?: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    at?: number;
    raw?: any;
};

type State = {
    list: UINotification[];
    push: (n: Omit<UINotification, 'id' | 'at'>) => void;
    clear: () => void;
    remove: (id: string) => void;
};

export const useNotificationStore = create<State>((set) => ({
    list: [],
    push: (n) =>
        set((s) => ({
            list: [
                ...s.list,
                {
                    id: `${Date.now()}-${Math.random()}`,
                    at: Date.now(),
                    type: n.type ?? 'info',
                    ...n,
                },
            ],
        })),
    clear: () => set({ list: [] }),
    remove: (id) =>
        set((s) => ({
            list: s.list.filter((n) => n.id !== id),
        })),
}));

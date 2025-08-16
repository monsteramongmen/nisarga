import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import type { MenuItem } from '@/lib/data';

const menuCollection = collection(db, 'menuItems');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): MenuItem => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        category: data.category,
        price: data.price
    };
}

export const getMenuItems = async (): Promise<MenuItem[]> => {
    const snapshot = await getDocs(menuCollection);
    return snapshot.docs.map(fromFirestore);
};

export const addMenuItem = async (itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const docRef = await addDoc(menuCollection, itemData);
    const newDoc = await getDoc(docRef);
    return fromFirestore(newDoc as QueryDocumentSnapshot<DocumentData>);
};

export const updateMenuItem = async (id: string, itemData: Partial<MenuItem>): Promise<void> => {
    const itemDoc = doc(db, 'menuItems', id);
    await updateDoc(itemDoc, itemData);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    const itemDoc = doc(db, 'menuItems', id);
    await deleteDoc(itemDoc);
};

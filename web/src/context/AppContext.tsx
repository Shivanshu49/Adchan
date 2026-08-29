"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ServiceKey =
  | "status"
  | "ekyc"
  | "registration"
  | "schemes"
  | "payment"
  | "eligibility"
  | "help"
  | "weather"
  | "crops"
  | "fertilizer"
  | "calculator"
  | "notifications"
  | "videos"
  | "profile";

export type SupportedLang = "hi" | "en" | "mr" | "gu";

interface ModalData {
  isOpen: boolean;
  title: string;
  serviceKey?: ServiceKey;
  customContent?: ReactNode;
}

interface AppContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  modalData: ModalData;
  openServiceModal: (serviceKey: ServiceKey) => void;
  openCustomModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;
  isVoiceOpen: boolean;
  openVoice: () => void;
  closeVoice: () => void;
  lang: SupportedLang;
  setLang: (l: SupportedLang) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({
    isOpen: false,
    title: "",
  });
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLang>("hi");

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const openServiceModal = (serviceKey: ServiceKey) => {
    setModalData({
      isOpen: true,
      title: "",
      serviceKey,
    });
  };

  const openCustomModal = (title: string, content: ReactNode) => {
    setModalData({
      isOpen: true,
      title,
      customContent: content,
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      title: "",
      serviceKey: undefined,
      customContent: undefined,
    });
  };

  const openVoice = () => setIsVoiceOpen(true);
  const closeVoice = () => setIsVoiceOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isVoiceOpen) closeVoice();
        if (modalData.isOpen) closeModal();
        if (isDrawerOpen) closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVoiceOpen, modalData.isOpen, isDrawerOpen]);

  useEffect(() => {
    if (isDrawerOpen || modalData.isOpen || isVoiceOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.body.classList.remove("drawer-open");
    }
  }, [isDrawerOpen, modalData.isOpen, isVoiceOpen]);

  return (
    <AppContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        modalData,
        openServiceModal,
        openCustomModal,
        closeModal,
        isVoiceOpen,
        openVoice,
        closeVoice,
        lang,
        setLang,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Bell, CheckCheck } from "lucide-react";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const load = async () => setNotifs((await api.get("/notifications")).data);
  useEffect(() => { load(); }, []);
  const readAll = async () => { await api.post("/notifications/read-all"); load(); };
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="font-heading font-extrabold text-3xl flex items-center gap-2"><Bell className="w-6 h-6" /> Notifications</h1><Button variant="outline" onClick={readAll} data-testid="notif-read-all"><CheckCheck className="w-4 h-4 mr-1" /> Mark all read</Button></div>
      <div className="space-y-2">{notifs.map((n) => (
        <Card key={n.id} className={n.read?"":"border-blue-300 bg-blue-50/40"}><CardContent className="p-4 flex items-center justify-between gap-3"><div><div className="text-sm">{n.message}</div><div className="text-xs text-slate-500 mt-0.5">{new Date(n.created_at).toLocaleString()}</div></div><Badge variant="outline">{n.type}</Badge></CardContent></Card>
      ))}
      {!notifs.length && <div className="text-center text-slate-500 py-10">No notifications.</div>}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, API } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [search] = useSearchParams();
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const loadConvs = async () => {
    const r = await api.get("/conversations"); setConvs(r.data);
    const to = search.get("to");
    if (to && !active) {
      // send init empty? Instead just create a conversation stub by preselecting the user
      const existing = r.data.find((c) => c.other?.id === to);
      if (existing) setActive(existing);
      else setActive({ other: { id: to }, id: null });
    }
  };
  useEffect(() => { loadConvs(); }, []);
  useEffect(() => {
    if (!active?.id) { setMsgs([]); return; }
    api.get(`/conversations/${active.id}/messages`).then((r) => setMsgs(r.data));
    const t = setInterval(() => api.get(`/conversations/${active.id}/messages`).then((r) => setMsgs(r.data)), 5000);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!text || !active?.other?.id) return;
    await api.post("/messages", { recipient_id: active.other.id, content: text });
    setText(""); await loadConvs();
    // Reselect the newly created conversation if it was a stub
    const r = await api.get("/conversations");
    const found = r.data.find((c) => c.other?.id === active.other.id);
    if (found) setActive(found);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[75vh]">
      <Card className="md:col-span-1 overflow-hidden"><CardContent className="p-0 h-full flex flex-col">
        <div className="p-4 border-b font-heading font-semibold">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {convs.map((c) => (
            <button key={c.id} onClick={()=>setActive(c)} data-testid={`conv-${c.id}`} className={`w-full text-left p-3 border-b hover:bg-slate-50 ${active?.id===c.id?"bg-blue-50":""}`}>
              <div className="flex items-center gap-3"><Avatar className="w-9 h-9"><AvatarFallback className="bg-slate-800 text-white text-xs">{(c.other?.first_name?.[0]||"?")}{(c.other?.last_name?.[0]||"")}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{c.other?.first_name} {c.other?.last_name}</div><div className="text-xs text-slate-500 truncate">{c.last_message}</div></div>
                {c.unread > 0 && <Badge className="bg-blue-600 text-white text-[10px]">{c.unread}</Badge>}
              </div>
            </button>
          ))}
          {!convs.length && <div className="p-4 text-sm text-slate-500">No conversations yet.</div>}
        </div>
      </CardContent></Card>
      <Card className="md:col-span-2 overflow-hidden"><CardContent className="p-0 h-full flex flex-col">
        {active ? (<>
          <div className="p-4 border-b font-heading font-semibold">Chat with {active.other?.first_name || "user"}</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender_id===user.id?"justify-end":"justify-start"}`}>
                <div className={`max-w-md px-3 py-2 rounded-lg text-sm ${m.sender_id===user.id?"bg-blue-600 text-white":"bg-white border"}`}>{m.content}<div className={`text-[10px] mt-1 ${m.sender_id===user.id?"text-blue-100":"text-slate-400"}`}>{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div></div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t flex gap-2"><Input data-testid="msg-input" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&send()} placeholder="Type a message…" /><Button onClick={send} className="bg-blue-600 hover:bg-blue-700" data-testid="msg-send"><Send className="w-4 h-4"/></Button></div>
        </>) : (<div className="flex-1 flex items-center justify-center text-slate-500">Select a conversation to start.</div>)}
      </CardContent></Card>
    </div>
  );
}
function Badge({ className, children }) { return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>; }

const $=id=>document.getElementById(id);
const body=$("itemsBody");

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function today(){const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function plusDays(s,n){const d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function nextNo(){let n=+(localStorage.getItem("driSeq")||1000)+1;localStorage.setItem("driSeq",n);return `DRI/QTN/${new Date().getFullYear()}/${String(n).padStart(4,"0")}`;}
function money(n){return $("currency").value+" "+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});}
function addItem(x={}){
 const r=document.createElement("tr");
 r.innerHTML=`<td class="sno"></td>
 <td><input class="desc" value="${esc(x.desc)}" placeholder="Part / service description"></td>
 <td><input class="hsn" value="${esc(x.hsn)}" placeholder="HSN"></td>
 <td><input class="qty" type="number" min="0" step="0.01" value="${x.qty??1}"></td>
 <td><input class="unit" value="${esc(x.unit||"Nos")}"></td>
 <td><input class="rate" type="number" min="0" step="0.01" value="${x.rate??0}"></td>
 <td class="amount">₹ 0.00</td>
 <td class="no-print"><button class="remove">×</button></td>`;
 body.appendChild(r);
 r.querySelectorAll("input").forEach(i=>i.addEventListener("input",calc));
 r.querySelector(".remove").onclick=()=>{r.remove();renumber();calc()};
 renumber();calc();
}
function renumber(){[...body.rows].forEach((r,i)=>r.querySelector(".sno").textContent=i+1);}
function calc(){
 let sub=0;
 [...body.rows].forEach(r=>{let q=+r.querySelector(".qty").value||0,rate=+r.querySelector(".rate").value||0,a=q*rate;sub+=a;r.querySelector(".amount").textContent=money(a)});
 let dp=+$("discount").value||0, disc=sub*dp/100, taxable=Math.max(0,sub-disc);
 let cp=+$("cgst").value||0,sp=+$("sgst").value||0,cgst=taxable*cp/100,sgst=taxable*sp/100,total=taxable+cgst+sgst;
 $("subtotal").textContent=money(sub);$("discountAmount").textContent=money(disc);$("cgstAmount").textContent=money(cgst);$("sgstAmount").textContent=money(sgst);$("grandTotal").textContent=money(total);$("amountWords").textContent=words(Math.round(total))+" Only";
}
const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
function under1000(n){let s="";if(n>=100){s+=ones[Math.floor(n/100)]+" Hundred ";n%=100}if(n>=20){s+=tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"")}else if(n>0)s+=ones[n];return s.trim();}
function words(n){if(!n)return"Rupees Zero";let parts=[];if(n>=10000000){parts.push(under1000(Math.floor(n/10000000))+" Crore");n%=10000000}if(n>=100000){parts.push(under1000(Math.floor(n/100000))+" Lakh");n%=100000}if(n>=1000){parts.push(under1000(Math.floor(n/1000))+" Thousand");n%=1000}if(n>0)parts.push(under1000(n));return"Rupees "+parts.join(" ");}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function collect(){return{
 quoteNo:$("quoteNo").value,quoteDate:$("quoteDate").value,validUntil:$("validUntil").value,
 customerName:$("customerName").value,contactPerson:$("contactPerson").value,customerPhone:$("customerPhone").value,customerEmail:$("customerEmail").value,customerGstin:$("customerGstin").value,customerState:$("customerState").value,customerAddress:$("customerAddress").value,
 placeSupply:$("placeSupply").value,paymentTerms:$("paymentTerms").value,deliveryTerms:$("deliveryTerms").value,currency:$("currency").value,notes:$("notes").value,discount:$("discount").value,cgst:$("cgst").value,sgst:$("sgst").value,
 items:[...body.rows].map(r=>({desc:r.querySelector(".desc").value,hsn:r.querySelector(".hsn").value,qty:r.querySelector(".qty").value,unit:r.querySelector(".unit").value,rate:r.querySelector(".rate").value}))
}}
function load(d){Object.keys(d).forEach(k=>{const e=$(k);if(e&&typeof d[k]!=="object")e.value=d[k]});body.innerHTML="";(d.items||[]).forEach(addItem);calc();}
function fresh(){const d=today();$("quoteNo").value=nextNo();$("quoteDate").value=d;$("validUntil").value=plusDays(d,15);body.innerHTML="";addItem();addItem();}
$("addItem").onclick=()=>addItem();
["discount","cgst","sgst","currency"].forEach(id=>$(id).addEventListener("input",calc));
$("printBtn").onclick=()=>window.print();
$("saveBtn").onclick=()=>{localStorage.setItem("driQuotation",JSON.stringify(collect()));toast("Quotation saved");};
$("newBtn").onclick=()=>{if(confirm("Create a new quotation?"))fresh()};
window.addEventListener("load",()=>{let s=localStorage.getItem("driQuotation");if(s){try{load(JSON.parse(s));return}catch(e){}}fresh()});

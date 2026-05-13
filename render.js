function getCursoInfo(t){
t=t.toUpperCase();
if(t.includes("AGROEC")) return {cl:"c-agroec",rgb:[232,245,233]};
if(t.includes("AGROPEC")) return {cl:"c-agropec",rgb:[227,242,253]};
if(t.includes("INFO")) return {cl:"c-info",rgb:[255,248,225]};
if(t.includes("GEO")) return {cl:"c-geo",rgb:[243,229,245]};
if(t.includes("MAT")) return {cl:"c-mat",rgb:[224,247,250]};
if(t.includes("AGRONEG")) return {cl:"c-agroneg",rgb:[239,235,233]};
if(t.includes("ZOO")) return {cl:"c-zoo",rgb:[252,228,236]};
if(t.includes("AGRON")) return {cl:"c-agron",rgb:[241,248,233]};
return {cl:"",rgb:[255,255,255]};
}

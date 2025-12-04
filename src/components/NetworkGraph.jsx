import React, { useEffect, useRef, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_network_static from "highcharts/modules/networkgraph";
import "./NetworkGraph.css";

/**
 * Expanded but still small-ish mock data — keeps structure to demonstrate
 * parent -> children -> grandchildren color propagation.
 */
const DATA = [
  ["Proto Indo-European", "Germanic"],
  ["Proto Indo-European", "Celtic"],
  ["Proto Indo-European", "Italic"],
  ["Proto Indo-European", "Indo-Iranian"],

  // Germanic branch
  ["Germanic", "North Germanic"],
  ["Germanic", "West Germanic"],
  ["North Germanic", "Old Norse"],
  ["Old Norse", "Old Icelandic"],
  ["West Germanic", "Old English"],
  ["Old English", "Middle English"],

  // Italic branch
  ["Italic", "Latino-Faliscan"],
  ["Latino-Faliscan", "Latin"],
  ["Latin", "Spanish"],
  ["Latin", "French"],
  ["Latin", "Italian"],

  // Celtic branch
  ["Celtic", "Brythonic"],
  ["Brythonic", "Welsh"],
  ["Brythonic", "Breton"],
  ["Celtic", "Goidelic"],
  ["Goidelic", "Irish"],

  // Indo-Iranian branch
  ["Indo-Iranian", "Indic"],
  ["Indic", "Sanskrit"],
  ["Indic", "Prakrit"],
  ["Indo-Iranian", "Iranian"],
  ["Iranian", "Old Persian"],

  // a few leaves
  ["Proto Indo-European", "Armenian"],
  ["Proto Indo-European", "Phrygian"]
];

export default function NetworkGraph({
  height = "100%",
  title = "Indo-European Language Tree (Medium)"
}) {
  const wrapperRef = useRef(null);
  const chartComponentRef = useRef(null);
  const [moduleReady, setModuleReady] = useState(false);

  // Robust initialization attempt (static -> dynamic -> CDN fallback handled elsewhere if needed)
  useEffect(() => {
    let cancelled = false;
    let scriptEl = null;
    const TIMEOUT_MS = 100000;

    function tryInitModule(mod) {
      const fn = (mod && (mod.default || mod)) || null;
      if (typeof fn === "function") {
        try {
          fn(Highcharts);
          return true;
        } catch (err) {
          console.warn("Highcharts network module initialization failed:", err);
          return false;
        }
      }
      return false;
    }

    async function init() {
      try {
        if (tryInitModule(HC_network_static)) {
          if (!cancelled) setModuleReady(true);
          return;
        }
      } catch (e) {
        console.warn("Static init failed:", e);
      }

      // dynamic import fallback
      try {
        const m = await import("highcharts/modules/networkgraph");
        if (tryInitModule(m)) {
          if (!cancelled) setModuleReady(true);
          return;
        } else {
          console.warn("Dynamic import returned non-callable module:", m);
        }
      } catch (err) {
        console.warn("Dynamic import failed:", err);
      }

      // CDN fallback
      try {
        if (typeof window !== "undefined" && !window.Highcharts) window.Highcharts = Highcharts;

        if (Highcharts && Highcharts.Series && Highcharts.Series.types && Highcharts.Series.types.networkgraph) {
          if (!cancelled) setModuleReady(true);
          return;
        }

        scriptEl = document.createElement("script");
        scriptEl.src = "https://code.highcharts.com/modules/networkgraph.js";
        scriptEl.async = true;
        document.head.appendChild(scriptEl);

        const start = Date.now();
        const poll = (resolve, reject) => {
          if (cancelled) return reject(new Error("Cancelled"));
          if (Highcharts && Highcharts.Series && Highcharts.Series.types && Highcharts.Series.types.networkgraph) return resolve(true);
          if (Date.now() - start > TIMEOUT_MS) return reject(new Error("Timeout waiting for networkgraph module from CDN"));
          setTimeout(() => poll(resolve, reject), 150);
        };

        await new Promise(poll);
        if (!cancelled) setModuleReady(true);
        return;
      } catch (err) {
        console.error("Failed to initialize highcharts networkgraph module from CDN:", err);
        if (!cancelled) setModuleReady(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, []);

  // afterSetOptions: color & radius logic (same as your original)
  useEffect(() => {
    const handler = function (e) {
      const colors = Highcharts.getOptions().colors || [];
      const nodes = {};
      let i = 0;

      if (this instanceof Highcharts.Series.types?.networkgraph && e.options.id === "lang-tree") {
        e.options.data.forEach(function (link) {
          if (link[0] === "Proto Indo-European") {
            nodes["Proto Indo-European"] = { id: "Proto Indo-European", marker: { radius: 20 } };
            nodes[link[1]] = { id: link[1], marker: { radius: 10 }, color: colors[i++] };
          } else if (nodes[link[0]] && nodes[link[0]].color) {
            nodes[link[1]] = { id: link[1], color: nodes[link[0]].color };
          }
        });

        e.options.nodes = Object.keys(nodes).map((id) => nodes[id]);
      }
    };

    Highcharts.addEvent(Highcharts.Series, "afterSetOptions", handler);

    return () => {
      try {
        Highcharts.removeEvent(Highcharts.Series, "afterSetOptions", handler);
      } catch (err) {
        // ignore
      }
    };
  }, []);

  // Adjust gravitationalConstant on resize (keeps layout stable on small screens)
  useEffect(() => {
    let raf = null;
    const setGravity = () => {
      const width = wrapperRef.current ? wrapperRef.current.offsetWidth : 800;
      const chart = chartComponentRef.current && chartComponentRef.current.chart;
      const small = width < 500;
      const g = small ? 0.2 : 0.06;
      if (chart && chart.series && chart.series.length) {
        try {
          chart.update({
            plotOptions: {
              networkgraph: {
                layoutAlgorithm: { gravitationalConstant: g }
              }
            }
          }, false, false, false);
        } catch (e) { /* ignore */ }
      }
    };

    setGravity();
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setGravity);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [moduleReady]);

  // Memoized chart options — note chart.height is smaller so nodes sit closer to the center
  const options = useMemo(() => ({
    chart: {
      type: "networkgraph",
      height: "75%",              // smaller chart area, wrapper will vertically center it
      spacingTop: 6,
      spacingBottom: 6,
      spacingLeft: 8,
      spacingRight: 8
    },
    title: { text: title, align: "left", verticalAlign: "top", y: 0, style: { fontSize: "18px" } },
    subtitle: { text: "A Force-Directed Network Graph in Highcharts", align: "left", y: 18, style: { fontSize: "12px", color: "#666" } },
    plotOptions: {
      networkgraph: {
        keys: ["from", "to"],
        layoutAlgorithm: {
          enableSimulation: true,
          friction: -0.9
        }
      }
    },
    series: [{
      id: "lang-tree",
      accessibility: { enabled: false },
      dataLabels: { enabled: true, linkFormat: "", style: { fontSize: "0.78em", fontWeight: "normal", textOutline: "none" } },
      data: DATA
    }],
    credits: { enabled: false }
  }), [title]);

  // show loader until module ready
  if (!moduleReady) {
    return (
      <div ref={wrapperRef} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading chart module…</div>
      </div>
    );
  }

  return (
    <div className="networkgraph-wrapper center-wrapper" ref={wrapperRef} style={{ height }}>
      <div className="networkgraph-inner">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
          containerProps={{ style: { height: "100%", width: "100%" } }}
        />
      </div>
    </div>
  );
}

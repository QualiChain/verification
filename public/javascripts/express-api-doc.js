
var requirejs, require, define;

! function(global, setTimeout) {
	function commentReplace(e, t) {
		return t || ""
	}

	function isFunction(e) {
		return "[object Function]" === ostring.call(e)
	}

	function isArray(e) {
		return "[object Array]" === ostring.call(e)
	}

	function each(e, t) {
		if (e) {
			var i;
			for (i = 0; i < e.length && (!e[i] || !t(e[i], i, e)); i += 1);
		}
	}

	function eachReverse(e, t) {
		if (e) {
			var i;
			for (i = e.length - 1; i > -1 && (!e[i] || !t(e[i], i, e)); i -= 1);
		}
	}

	function hasProp(e, t) {
		return hasOwn.call(e, t)
	}

	function getOwn(e, t) {
		return hasProp(e, t) && e[t]
	}

	function eachProp(e, t) {
		var i;
		for (i in e)
			if (hasProp(e, i) && t(e[i], i)) break
	}

	function mixin(e, t, i, r) {
		return t && eachProp(t, function(t, n) {
			!i && hasProp(e, n) || (!r || "object" != typeof t || !t || isArray(t) || isFunction(t) || t instanceof RegExp ? e[n] = t : (e[n] || (e[n] = {}), mixin(e[n], t, i, r)))
		}), e
	}

	function bind(e, t) {
		return function() {
			return t.apply(e, arguments)
		}
	}

	function scripts() {
		return document.getElementsByTagName("script")
	}

	function defaultOnError(e) {
		throw e
	}

	function getGlobal(e) {
		if (!e) return e;
		var t = global;
		return each(e.split("."), function(e) {
			t = t[e]
		}), t
	}

	function makeError(e, t, i, r) {
		var n = new Error(t + "\nhttp://requirejs.org/docs/errors.html#" + e);
		return n.requireType = e, n.requireModules = r, i && (n.originalError = i), n
	}

	function newContext(e) {
		function t(e) {
			var t, i;
			for (t = 0; t < e.length; t++)
				if (i = e[t], "." === i) e.splice(t, 1), t -= 1;
				else if (".." === i) {
				if (0 === t || 1 === t && ".." === e[2] || ".." === e[t - 1]) continue;
				t > 0 && (e.splice(t - 1, 2), t -= 2)
			}
		}

		function i(e, i, r) {
			var n, o, a, s, u, c, d, p, f, l, h, m, g = i && i.split("/"),
				v = y.map,
				x = v && v["*"];
			if (e && (e = e.split("/"), d = e.length - 1, y.nodeIdCompat && jsSuffixRegExp.test(e[d]) && (e[d] = e[d].replace(jsSuffixRegExp, "")), "." === e[0].charAt(0) && g && (m = g.slice(0, g.length - 1), e = m.concat(e)), t(e), e = e.join("/")), r && v && (g || x)) {
				a = e.split("/");
				e: for (s = a.length; s > 0; s -= 1) {
					if (c = a.slice(0, s).join("/"), g)
						for (u = g.length; u > 0; u -= 1)
							if (o = getOwn(v, g.slice(0, u).join("/")), o && (o = getOwn(o, c))) {
								p = o, f = s;
								break e
							}!l && x && getOwn(x, c) && (l = getOwn(x, c), h = s)
				}!p && l && (p = l, f = h), p && (a.splice(0, f, p), e = a.join("/"))
			}
			return n = getOwn(y.pkgs, e), n ? n : e
		}

		function r(e) {
			isBrowser && each(scripts(), function(t) {
				if (t.getAttribute("data-requiremodule") === e && t.getAttribute("data-requirecontext") === q.contextName) return t.parentNode.removeChild(t), !0
			})
		}

		function n(e) {
			var t = getOwn(y.paths, e);
			if (t && isArray(t) && t.length > 1) return t.shift(), q.require.undef(e), q.makeRequire(null, {
				skipMap: !0
			})([e]), !0
		}

		function o(e) {
			var t, i = e ? e.indexOf("!") : -1;
			return i > -1 && (t = e.substring(0, i), e = e.substring(i + 1, e.length)), [t, e]
		}

		function a(e, t, r, n) {
			var a, s, u, c, d = null,
				p = t ? t.name : null,
				f = e,
				l = !0,
				h = "";
			return e || (l = !1, e = "_@r" + (T += 1)), c = o(e), d = c[0], e = c[1], d && (d = i(d, p, n), s = getOwn(j, d)), e && (d ? h = s && s.normalize ? s.normalize(e, function(e) {
				return i(e, p, n)
			}) : e.indexOf("!") === -1 ? i(e, p, n) : e : (h = i(e, p, n), c = o(h), d = c[0], h = c[1], r = !0, a = q.nameToUrl(h))), u = !d || s || r ? "" : "_unnormalized" + (A += 1), {
				prefix: d,
				name: h,
				parentMap: t,
				unnormalized: !!u,
				url: a,
				originalName: f,
				isDefine: l,
				id: (d ? d + "!" + h : h) + u
			}
		}

		function s(e) {
			var t = e.id,
				i = getOwn(S, t);
			return i || (i = S[t] = new q.Module(e)), i
		}

		function u(e, t, i) {
			var r = e.id,
				n = getOwn(S, r);
			!hasProp(j, r) || n && !n.defineEmitComplete ? (n = s(e), n.error && "error" === t ? i(n.error) : n.on(t, i)) : "defined" === t && i(j[r])
		}

		function c(e, t) {
			var i = e.requireModules,
				r = !1;
			t ? t(e) : (each(i, function(t) {
				var i = getOwn(S, t);
				i && (i.error = e, i.events.error && (r = !0, i.emit("error", e)))
			}), r || req.onError(e))
		}

		function d() {
			globalDefQueue.length && (each(globalDefQueue, function(e) {
				var t = e[0];
				"string" == typeof t && (q.defQueueMap[t] = !0), O.push(e)
			}), globalDefQueue = [])
		}

		function p(e) {
			delete S[e], delete k[e]
		}

		function f(e, t, i) {
			var r = e.map.id;
			e.error ? e.emit("error", e.error) : (t[r] = !0, each(e.depMaps, function(r, n) {
				var o = r.id,
					a = getOwn(S, o);
				!a || e.depMatched[n] || i[o] || (getOwn(t, o) ? (e.defineDep(n, j[o]), e.check()) : f(a, t, i))
			}), i[r] = !0)
		}

		function l() {
			var e, t, i = 1e3 * y.waitSeconds,
				o = i && q.startTime + i < (new Date).getTime(),
				a = [],
				s = [],
				u = !1,
				d = !0;
			if (!x) {
				if (x = !0, eachProp(k, function(e) {
						var i = e.map,
							c = i.id;
						if (e.enabled && (i.isDefine || s.push(e), !e.error))
							if (!e.inited && o) n(c) ? (t = !0, u = !0) : (a.push(c), r(c));
							else if (!e.inited && e.fetched && i.isDefine && (u = !0, !i.prefix)) return d = !1
					}), o && a.length) return e = makeError("timeout", "Load timeout for modules: " + a, null, a), e.contextName = q.contextName, c(e);
				d && each(s, function(e) {
					f(e, {}, {})
				}), o && !t || !u || !isBrowser && !isWebWorker || w || (w = setTimeout(function() {
					w = 0, l()
				}, 50)), x = !1
			}
		}

		function h(e) {
			hasProp(j, e[0]) || s(a(e[0], null, !0)).init(e[1], e[2])
		}

		function m(e, t, i, r) {
			e.detachEvent && !isOpera ? r && e.detachEvent(r, t) : e.removeEventListener(i, t, !1)
		}

		function g(e) {
			var t = e.currentTarget || e.srcElement;
			return m(t, q.onScriptLoad, "load", "onreadystatechange"), m(t, q.onScriptError, "error"), {
				node: t,
				id: t && t.getAttribute("data-requiremodule")
			}
		}

		function v() {
			var e;
			for (d(); O.length;) {
				if (e = O.shift(), null === e[0]) return c(makeError("mismatch", "Mismatched anonymous define() module: " + e[e.length - 1]));
				h(e)
			}
			q.defQueueMap = {}
		}
		var x, b, q, E, w, y = {
				waitSeconds: 7,
				baseUrl: routesBaseURL,
				paths: {},
				bundles: {},
				pkgs: {},
				shim: {},
				config: {}
			},
			S = {},
			k = {},
			M = {},
			O = [],
			j = {},
			P = {},
			R = {},
			T = 1,
			A = 1;
		return E = {
			require: function(e) {
				return e.require ? e.require : e.require = q.makeRequire(e.map)
			},
			exports: function(e) {
				if (e.usingExports = !0, e.map.isDefine) return e.exports ? j[e.map.id] = e.exports : e.exports = j[e.map.id] = {}
			},
			module: function(e) {
				return e.module ? e.module : e.module = {
					id: e.map.id,
					uri: e.map.url,
					config: function() {
						return getOwn(y.config, e.map.id) || {}
					},
					exports: e.exports || (e.exports = {})
				}
			}
		}, b = function(e) {
			this.events = getOwn(M, e.id) || {}, this.map = e, this.shim = getOwn(y.shim, e.id), this.depExports = [], this.depMaps = [], this.depMatched = [], this.pluginMaps = {}, this.depCount = 0
		}, b.prototype = {
			init: function(e, t, i, r) {
				r = r || {}, this.inited || (this.factory = t, i ? this.on("error", i) : this.events.error && (i = bind(this, function(e) {
					this.emit("error", e)
				})), this.depMaps = e && e.slice(0), this.errback = i, this.inited = !0, this.ignore = r.ignore, r.enabled || this.enabled ? this.enable() : this.check())
			},
			defineDep: function(e, t) {
				this.depMatched[e] || (this.depMatched[e] = !0, this.depCount -= 1, this.depExports[e] = t)
			},
			fetch: function() {
				if (!this.fetched) {
					this.fetched = !0, q.startTime = (new Date).getTime();
					var e = this.map;
					return this.shim ? void q.makeRequire(this.map, {
						enableBuildCallback: !0
					})(this.shim.deps || [], bind(this, function() {
						return e.prefix ? this.callPlugin() : this.load()
					})) : e.prefix ? this.callPlugin() : this.load()
				}
			},
			load: function() {
				var e = this.map.url;
				P[e] || (P[e] = !0, q.load(this.map.id, e))
			},
			check: function() {
				if (this.enabled && !this.enabling) {
					var e, t, i = this.map.id,
						r = this.depExports,
						n = this.exports,
						o = this.factory;
					if (this.inited) {
						if (this.error) this.emit("error", this.error);
						else if (!this.defining) {
							if (this.defining = !0, this.depCount < 1 && !this.defined) {
								if (isFunction(o)) {
									if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) try {
										n = q.execCb(i, o, r, n)
									} catch (t) {
										e = t
									} else n = q.execCb(i, o, r, n);
									if (this.map.isDefine && void 0 === n && (t = this.module, t ? n = t.exports : this.usingExports && (n = this.exports)), e) return e.requireMap = this.map, e.requireModules = this.map.isDefine ? [this.map.id] : null, e.requireType = this.map.isDefine ? "define" : "require", c(this.error = e)
								} else n = o;
								if (this.exports = n, this.map.isDefine && !this.ignore && (j[i] = n, req.onResourceLoad)) {
									var a = [];
									each(this.depMaps, function(e) {
										a.push(e.normalizedMap || e)
									}), req.onResourceLoad(q, this.map, a)
								}
								p(i), this.defined = !0
							}
							this.defining = !1, this.defined && !this.defineEmitted && (this.defineEmitted = !0, this.emit("defined", this.exports), this.defineEmitComplete = !0)
						}
					} else hasProp(q.defQueueMap, i) || this.fetch()
				}
			},
			callPlugin: function() {
				var e = this.map,
					t = e.id,
					r = a(e.prefix);
				this.depMaps.push(r), u(r, "defined", bind(this, function(r) {
					var n, o, d, f = getOwn(R, this.map.id),
						l = this.map.name,
						h = this.map.parentMap ? this.map.parentMap.name : null,
						m = q.makeRequire(e.parentMap, {
							enableBuildCallback: !0
						});
					return this.map.unnormalized ? (r.normalize && (l = r.normalize(l, function(e) {
						return i(e, h, !0)
					}) || ""), o = a(e.prefix + "!" + l, this.map.parentMap), u(o, "defined", bind(this, function(e) {
						this.map.normalizedMap = o, this.init([], function() {
							return e
						}, null, {
							enabled: !0,
							ignore: !0
						})
					})), d = getOwn(S, o.id), void(d && (this.depMaps.push(o), this.events.error && d.on("error", bind(this, function(e) {
						this.emit("error", e)
					})), d.enable()))) : f ? (this.map.url = q.nameToUrl(f), void this.load()) : (n = bind(this, function(e) {
						this.init([], function() {
							return e
						}, null, {
							enabled: !0
						})
					}), n.error = bind(this, function(e) {
						this.inited = !0, this.error = e, e.requireModules = [t], eachProp(S, function(e) {
							0 === e.map.id.indexOf(t + "_unnormalized") && p(e.map.id)
						}), c(e)
					}), n.fromText = bind(this, function(i, r) {
						var o = e.name,
							u = a(o),
							d = useInteractive;
						r && (i = r), d && (useInteractive = !1), s(u), hasProp(y.config, t) && (y.config[o] = y.config[t]);
						try {
							req.exec(i)
						} catch (e) {
							return c(makeError("fromtexteval", "fromText eval for " + t + " failed: " + e, e, [t]))
						}
						d && (useInteractive = !0), this.depMaps.push(u), q.completeLoad(o), m([o], n)
					}), void r.load(e.name, m, n, y))
				})), q.enable(r, this), this.pluginMaps[r.id] = r
			},
			enable: function() {
				k[this.map.id] = this, this.enabled = !0, this.enabling = !0, each(this.depMaps, bind(this, function(e, t) {
					var i, r, n;
					if ("string" == typeof e) {
						if (e = a(e, this.map.isDefine ? this.map : this.map.parentMap, !1, !this.skipMap), this.depMaps[t] = e, n = getOwn(E, e.id)) return void(this.depExports[t] = n(this));
						this.depCount += 1, u(e, "defined", bind(this, function(e) {
							this.undefed || (this.defineDep(t, e), this.check())
						})), this.errback ? u(e, "error", bind(this, this.errback)) : this.events.error && u(e, "error", bind(this, function(e) {
							this.emit("error", e)
						}))
					}
					i = e.id, r = S[i], hasProp(E, i) || !r || r.enabled || q.enable(e, this)
				})), eachProp(this.pluginMaps, bind(this, function(e) {
					var t = getOwn(S, e.id);
					t && !t.enabled && q.enable(e, this)
				})), this.enabling = !1, this.check()
			},
			on: function(e, t) {
				var i = this.events[e];
				i || (i = this.events[e] = []), i.push(t)
			},
			emit: function(e, t) {
				each(this.events[e], function(e) {
					e(t)
				}), "error" === e && delete this.events[e]
			}
		}, q = {
			config: y,
			contextName: e,
			registry: S,
			defined: j,
			urlFetched: P,
			defQueue: O,
			defQueueMap: {},
			Module: b,
			makeModuleMap: a,
			nextTick: req.nextTick,
			onError: c,
			configure: function(e) {
				if (e.baseUrl && "/" !== e.baseUrl.charAt(e.baseUrl.length - 1) && (e.baseUrl += "/"), "string" == typeof e.urlArgs) {
					var t = e.urlArgs;
					e.urlArgs = function(e, i) {
						return (i.indexOf("?") === -1 ? "?" : "&") + t
					}
				}
				var i = y.shim,
					r = {
						paths: !0,
						bundles: !0,
						config: !0,
						map: !0
					};
				eachProp(e, function(e, t) {
					r[t] ? (y[t] || (y[t] = {}), mixin(y[t], e, !0, !0)) : y[t] = e
				}), e.bundles && eachProp(e.bundles, function(e, t) {
					each(e, function(e) {
						e !== t && (R[e] = t)
					})
				}), e.shim && (eachProp(e.shim, function(e, t) {
					isArray(e) && (e = {
						deps: e
					}), !e.exports && !e.init || e.exportsFn || (e.exportsFn = q.makeShimExports(e)), i[t] = e
				}), y.shim = i), e.packages && each(e.packages, function(e) {
					var t, i;
					e = "string" == typeof e ? {
						name: e
					} : e, i = e.name, t = e.location, t && (y.paths[i] = e.location), y.pkgs[i] = e.name + "/" + (e.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "")
				}), eachProp(S, function(e, t) {
					e.inited || e.map.unnormalized || (e.map = a(t, null, !0))
				}), (e.deps || e.callback) && q.require(e.deps || [], e.callback)
			},
			makeShimExports: function(e) {
				function t() {
					var t;
					return e.init && (t = e.init.apply(global, arguments)), t || e.exports && getGlobal(e.exports)
				}
				return t
			},
			makeRequire: function(t, n) {
				function o(i, r, u) {
					var d, p, f;
					return n.enableBuildCallback && r && isFunction(r) && (r.__requireJsBuild = !0), "string" == typeof i ? isFunction(r) ? c(makeError("requireargs", "Invalid require call"), u) : t && hasProp(E, i) ? E[i](S[t.id]) : req.get ? req.get(q, i, t, o) : (p = a(i, t, !1, !0), d = p.id, hasProp(j, d) ? j[d] : c(makeError("notloaded", 'Module name "' + d + '" has not been loaded yet for context: ' + e + (t ? "" : ". Use require([])")))) : (v(), q.nextTick(function() {
						v(), f = s(a(null, t)), f.skipMap = n.skipMap, f.init(i, r, u, {
							enabled: !0
						}), l()
					}), o)
				}
				return n = n || {}, mixin(o, {
					isBrowser: isBrowser,
					toUrl: function(e) {
						var r, n = e.lastIndexOf("."),
							o = e.split("/")[0],
							a = "." === o || ".." === o;
						return n !== -1 && (!a || n > 1) && (r = e.substring(n, e.length), e = e.substring(0, n)), q.nameToUrl(i(e, t && t.id, !0), r, !0)
					},
					defined: function(e) {
						return hasProp(j, a(e, t, !1, !0).id)
					},
					specified: function(e) {
						return e = a(e, t, !1, !0).id, hasProp(j, e) || hasProp(S, e)
					}
				}), t || (o.undef = function(e) {
					d();
					var i = a(e, t, !0),
						n = getOwn(S, e);
					n.undefed = !0, r(e), delete j[e], delete P[i.url], delete M[e], eachReverse(O, function(t, i) {
						t[0] === e && O.splice(i, 1)
					}), delete q.defQueueMap[e], n && (n.events.defined && (M[e] = n.events), p(e))
				}), o
			},
			enable: function(e) {
				var t = getOwn(S, e.id);
				t && s(e).enable()
			},
			completeLoad: function(e) {
				var t, i, r, o = getOwn(y.shim, e) || {},
					a = o.exports;
				for (d(); O.length;) {
					if (i = O.shift(), null === i[0]) {
						if (i[0] = e, t) break;
						t = !0
					} else i[0] === e && (t = !0);
					h(i)
				}
				if (q.defQueueMap = {}, r = getOwn(S, e), !t && !hasProp(j, e) && r && !r.inited) {
					if (!(!y.enforceDefine || a && getGlobal(a))) return n(e) ? void 0 : c(makeError("nodefine", "No define call for " + e, null, [e]));
					h([e, o.deps || [], o.exportsFn])
				}
				l()
			},
			nameToUrl: function(e, t, i) {
				var r, n, o, a, s, u, c, d = getOwn(y.pkgs, e);
				if (d && (e = d), c = getOwn(R, e)) return q.nameToUrl(c, t, i);
				if (req.jsExtRegExp.test(e)) s = e + (t || "");
				else {
					for (r = y.paths, n = e.split("/"), o = n.length; o > 0; o -= 1)
						if (a = n.slice(0, o).join("/"), u = getOwn(r, a)) {
							isArray(u) && (u = u[0]), n.splice(0, o, u);
							break
						}
					s = n.join("/"), s += t || (/^data\:|^blob\:|\?/.test(s) || i ? "" : ".js"), s = ("/" === s.charAt(0) || s.match(/^[\w\+\.\-]+:/) ? "" : y.baseUrl) + s
				}
				return y.urlArgs && !/^blob\:/.test(s) ? s + y.urlArgs(e, s) : s
			},
			load: function(e, t) {
				req.load(q, e, t)
			},
			execCb: function(e, t, i, r) {
				return t.apply(r, i)
			},
			onScriptLoad: function(e) {
				if ("load" === e.type || readyRegExp.test((e.currentTarget || e.srcElement).readyState)) {
					interactiveScript = null;
					var t = g(e);
					q.completeLoad(t.id)
				}
			},
			onScriptError: function(e) {
				var t = g(e);
				if (!n(t.id)) {
					var i = [];
					return eachProp(S, function(e, r) {
						0 !== r.indexOf("_@r") && each(e.depMaps, function(e) {
							if (e.id === t.id) return i.push(r), !0
						})
					}), c(makeError("scripterror", 'Script error for "' + t.id + (i.length ? '", needed by: ' + i.join(", ") : '"'), e, [t.id]))
				}
			}
		}, q.require = q.makeRequire(), q
	}

	function getInteractiveScript() {
		return interactiveScript && "interactive" === interactiveScript.readyState ? interactiveScript : (eachReverse(scripts(), function(e) {
			if ("interactive" === e.readyState) return interactiveScript = e
		}), interactiveScript)
	}
	var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = "2.3.2",
		commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm,
		cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
		jsSuffixRegExp = /\.js$/,
		currDirRegExp = /^\.\//,
		op = Object.prototype,
		ostring = op.toString,
		hasOwn = op.hasOwnProperty,
		isBrowser = !("undefined" == typeof window || "undefined" == typeof navigator || !window.document),
		isWebWorker = !isBrowser && "undefined" != typeof importScripts,
		readyRegExp = isBrowser && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/,
		defContextName = "_",
		isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString(),
		contexts = {},
		cfg = {},
		globalDefQueue = [],
		useInteractive = !1;
	if ("undefined" == typeof define) {
		if ("undefined" != typeof requirejs) {
			if (isFunction(requirejs)) return;
			cfg = requirejs, requirejs = void 0
		}
		"undefined" == typeof require || isFunction(require) || (cfg = require, require = void 0), req = requirejs = function(e, t, i, r) {
			var n, o, a = defContextName;
			return isArray(e) || "string" == typeof e || (o = e, isArray(t) ? (e = t, t = i, i = r) : e = []), o && o.context && (a = o.context), n = getOwn(contexts, a), n || (n = contexts[a] = req.s.newContext(a)), o && n.configure(o), n.require(e, t, i)
		}, req.config = function(e) {
			return req(e)
		}, req.nextTick = "undefined" != typeof setTimeout ? function(e) {
			setTimeout(e, 4)
		} : function(e) {
			e()
		}, require || (require = req), req.version = version, req.jsExtRegExp = /^\/|:|\?|\.js$/, req.isBrowser = isBrowser, s = req.s = {
			contexts: contexts,
			newContext: newContext
		}, req({}), each(["toUrl", "undef", "defined", "specified"], function(e) {
			req[e] = function() {
				var t = contexts[defContextName];
				return t.require[e].apply(t, arguments)
			}
		}), isBrowser && (head = s.head = document.getElementsByTagName("head")[0], baseElement = document.getElementsByTagName("base")[0], baseElement && (head = s.head = baseElement.parentNode)), req.onError = defaultOnError, req.createNode = function(e, t, i) {
			var r = e.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
			return r.type = e.scriptType || "text/javascript", r.charset = "utf-8", r.async = !0, r
		}, req.load = function(e, t, i) {
			var r, n = e && e.config || {};
			if (isBrowser) return r = req.createNode(n, t, i), r.setAttribute("data-requirecontext", e.contextName), r.setAttribute("data-requiremodule", t), !r.attachEvent || r.attachEvent.toString && r.attachEvent.toString().indexOf("[native code") < 0 || isOpera ? (r.addEventListener("load", e.onScriptLoad, !1), r.addEventListener("error", e.onScriptError, !1)) : (useInteractive = !0, r.attachEvent("onreadystatechange", e.onScriptLoad)), r.src = i, n.onNodeCreated && n.onNodeCreated(r, n, t, i), currentlyAddingScript = r, baseElement ? head.insertBefore(r, baseElement) : head.appendChild(r), currentlyAddingScript = null, r;
			if (isWebWorker) try {
				setTimeout(function() {}, 0), importScripts(i), e.completeLoad(t)
			} catch (r) {
				e.onError(makeError("importscripts", "importScripts failed for " + t + " at " + i, r, [t]))
			}
		}, isBrowser && !cfg.skipDataMain && eachReverse(scripts(), function(e) {
			if (head || (head = e.parentNode), dataMain = e.getAttribute("data-main")) return mainScript = dataMain, cfg.baseUrl || mainScript.indexOf("!") !== -1 || (src = mainScript.split("/"), mainScript = src.pop(), subPath = src.length ? src.join("/") + "/" : "./", cfg.baseUrl = subPath), mainScript = mainScript.replace(jsSuffixRegExp, ""), req.jsExtRegExp.test(mainScript) && (mainScript = dataMain), cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript], !0
		}), define = function(e, t, i) {
			var r, n;
			"string" != typeof e && (i = t, t = e, e = null), isArray(t) || (i = t, t = null), !t && isFunction(i) && (t = [], i.length && (i.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function(e, i) {
				t.push(i)
			}), t = (1 === i.length ? ["require"] : ["require", "exports", "module"]).concat(t))), useInteractive && (r = currentlyAddingScript || getInteractiveScript(), r && (e || (e = r.getAttribute("data-requiremodule")), n = contexts[r.getAttribute("data-requirecontext")])), n ? (n.defQueue.push([e, t, i]), n.defQueueMap[e] = !0) : globalDefQueue.push([e, t, i])
		}, define.amd = {
			jQuery: !0
		}, req.exec = function(text) {
			return eval(text)
		}, req(cfg)
	}
}(this, "undefined" == typeof setTimeout ? void 0 : setTimeout);
"use strict";
! function() {
	require.config({
		baseUrl: "",
		waitSeconds: 30,
		paths: {},
		shim: {
			"backbone.chromestorage": {
				deps: ["backbone"]
			}
		}
	})
}();
if (function() {
		function e(e) {
			function t(t, n, r, i, o, s) {
				for (; o >= 0 && o < s; o += e) {
					var a = i ? i[o] : o;
					r = n(r, t[a], a, t)
				}
				return r
			}
			return function(n, r, i, o) {
				r = b(r, o, 4);
				var s = !C(n) && m.keys(n),
					a = (s || n).length,
					u = e > 0 ? 0 : a - 1;
				return arguments.length < 3 && (i = n[s ? s[u] : u], u += e), t(n, r, i, s, u, a)
			}
		}

		function t(e) {
			return function(t, n, r) {
				n = x(n, r);
				for (var i = E(t), o = e > 0 ? 0 : i - 1; o >= 0 && o < i; o += e)
					if (n(t[o], o, t)) return o;
				return -1
			}
		}

		function n(e, t, n) {
			return function(r, i, o) {
				var s = 0,
					a = E(r);
				if ("number" == typeof o) e > 0 ? s = o >= 0 ? o : Math.max(o + a, s) : a = o >= 0 ? Math.min(o + 1, a) : o + a + 1;
				else if (n && o && a) return o = n(r, i), r[o] === i ? o : -1;
				if (i !== i) return o = t(c.call(r, s, a), m.isNaN), o >= 0 ? o + s : -1;
				for (o = e > 0 ? s : a - 1; o >= 0 && o < a; o += e)
					if (r[o] === i) return o;
				return -1
			}
		}

		function r(e, t) {
			var n = I.length,
				r = e.constructor,
				i = m.isFunction(r) && r.prototype || a,
				o = "constructor";
			for (m.has(e, o) && !m.contains(t, o) && t.push(o); n--;) o = I[n], o in e && e[o] !== i[o] && !m.contains(t, o) && t.push(o)
		}
		var i = this,
			o = i._,
			s = Array.prototype,
			a = Object.prototype,
			u = Function.prototype,
			l = s.push,
			c = s.slice,
			p = a.toString,
			f = a.hasOwnProperty,
			h = Array.isArray,
			d = Object.keys,
			g = u.bind,
			v = Object.create,
			y = function() {},
			m = function(e) {
				return e instanceof m ? e : this instanceof m ? void(this._wrapped = e) : new m(e)
			};
		"undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = m), exports._ = m) : i._ = m, m.VERSION = "1.8.3";
		var b = function(e, t, n) {
				if (void 0 === t) return e;
				switch (null == n ? 3 : n) {
					case 1:
						return function(n) {
							return e.call(t, n)
						};
					case 2:
						return function(n, r) {
							return e.call(t, n, r)
						};
					case 3:
						return function(n, r, i) {
							return e.call(t, n, r, i)
						};
					case 4:
						return function(n, r, i, o) {
							return e.call(t, n, r, i, o)
						}
				}
				return function() {
					return e.apply(t, arguments)
				}
			},
			x = function(e, t, n) {
				return null == e ? m.identity : m.isFunction(e) ? b(e, t, n) : m.isObject(e) ? m.matcher(e) : m.property(e)
			};
		m.iteratee = function(e, t) {
			return x(e, t, 1 / 0)
		};
		var w = function(e, t) {
				return function(n) {
					var r = arguments.length;
					if (r < 2 || null == n) return n;
					for (var i = 1; i < r; i++)
						for (var o = arguments[i], s = e(o), a = s.length, u = 0; u < a; u++) {
							var l = s[u];
							t && void 0 !== n[l] || (n[l] = o[l])
						}
					return n
				}
			},
			_ = function(e) {
				if (!m.isObject(e)) return {};
				if (v) return v(e);
				y.prototype = e;
				var t = new y;
				return y.prototype = null, t
			},
			k = function(e) {
				return function(t) {
					return null == t ? void 0 : t[e]
				}
			},
			T = Math.pow(2, 53) - 1,
			E = k("length"),
			C = function(e) {
				var t = E(e);
				return "number" == typeof t && t >= 0 && t <= T
			};
		m.each = m.forEach = function(e, t, n) {
			t = b(t, n);
			var r, i;
			if (C(e))
				for (r = 0, i = e.length; r < i; r++) t(e[r], r, e);
			else {
				var o = m.keys(e);
				for (r = 0, i = o.length; r < i; r++) t(e[o[r]], o[r], e)
			}
			return e
		}, m.map = m.collect = function(e, t, n) {
			t = x(t, n);
			for (var r = !C(e) && m.keys(e), i = (r || e).length, o = Array(i), s = 0; s < i; s++) {
				var a = r ? r[s] : s;
				o[s] = t(e[a], a, e)
			}
			return o
		}, m.reduce = m.foldl = m.inject = e(1), m.reduceRight = m.foldr = e(-1), m.find = m.detect = function(e, t, n) {
			var r;
			if (r = C(e) ? m.findIndex(e, t, n) : m.findKey(e, t, n), void 0 !== r && r !== -1) return e[r]
		}, m.filter = m.select = function(e, t, n) {
			var r = [];
			return t = x(t, n), m.each(e, function(e, n, i) {
				t(e, n, i) && r.push(e)
			}), r
		}, m.reject = function(e, t, n) {
			return m.filter(e, m.negate(x(t)), n)
		}, m.every = m.all = function(e, t, n) {
			t = x(t, n);
			for (var r = !C(e) && m.keys(e), i = (r || e).length, o = 0; o < i; o++) {
				var s = r ? r[o] : o;
				if (!t(e[s], s, e)) return !1
			}
			return !0
		}, m.some = m.any = function(e, t, n) {
			t = x(t, n);
			for (var r = !C(e) && m.keys(e), i = (r || e).length, o = 0; o < i; o++) {
				var s = r ? r[o] : o;
				if (t(e[s], s, e)) return !0
			}
			return !1
		}, m.contains = m.includes = m.include = function(e, t, n, r) {
			return C(e) || (e = m.values(e)), ("number" != typeof n || r) && (n = 0), m.indexOf(e, t, n) >= 0
		}, m.invoke = function(e, t) {
			var n = c.call(arguments, 2),
				r = m.isFunction(t);
			return m.map(e, function(e) {
				var i = r ? t : e[t];
				return null == i ? i : i.apply(e, n)
			})
		}, m.pluck = function(e, t) {
			return m.map(e, m.property(t))
		}, m.where = function(e, t) {
			return m.filter(e, m.matcher(t))
		}, m.findWhere = function(e, t) {
			return m.find(e, m.matcher(t))
		}, m.max = function(e, t, n) {
			var r, i, o = -(1 / 0),
				s = -(1 / 0);
			if (null == t && null != e) {
				e = C(e) ? e : m.values(e);
				for (var a = 0, u = e.length; a < u; a++) r = e[a], r > o && (o = r)
			} else t = x(t, n), m.each(e, function(e, n, r) {
				i = t(e, n, r), (i > s || i === -(1 / 0) && o === -(1 / 0)) && (o = e, s = i)
			});
			return o
		}, m.min = function(e, t, n) {
			var r, i, o = 1 / 0,
				s = 1 / 0;
			if (null == t && null != e) {
				e = C(e) ? e : m.values(e);
				for (var a = 0, u = e.length; a < u; a++) r = e[a], r < o && (o = r)
			} else t = x(t, n), m.each(e, function(e, n, r) {
				i = t(e, n, r), (i < s || i === 1 / 0 && o === 1 / 0) && (o = e, s = i)
			});
			return o
		}, m.shuffle = function(e) {
			for (var t, n = C(e) ? e : m.values(e), r = n.length, i = Array(r), o = 0; o < r; o++) t = m.random(0, o), t !== o && (i[o] = i[t]), i[t] = n[o];
			return i
		}, m.sample = function(e, t, n) {
			return null == t || n ? (C(e) || (e = m.values(e)), e[m.random(e.length - 1)]) : m.shuffle(e).slice(0, Math.max(0, t))
		}, m.sortBy = function(e, t, n) {
			return t = x(t, n), m.pluck(m.map(e, function(e, n, r) {
				return {
					value: e,
					index: n,
					criteria: t(e, n, r)
				}
			}).sort(function(e, t) {
				var n = e.criteria,
					r = t.criteria;
				if (n !== r) {
					if (n > r || void 0 === n) return 1;
					if (n < r || void 0 === r) return -1
				}
				return e.index - t.index
			}), "value")
		};
		var A = function(e) {
			return function(t, n, r) {
				var i = {};
				return n = x(n, r), m.each(t, function(r, o) {
					var s = n(r, o, t);
					e(i, r, s)
				}), i
			}
		};
		m.groupBy = A(function(e, t, n) {
			m.has(e, n) ? e[n].push(t) : e[n] = [t]
		}), m.indexBy = A(function(e, t, n) {
			e[n] = t
		}), m.countBy = A(function(e, t, n) {
			m.has(e, n) ? e[n]++ : e[n] = 1
		}), m.toArray = function(e) {
			return e ? m.isArray(e) ? c.call(e) : C(e) ? m.map(e, m.identity) : m.values(e) : []
		}, m.size = function(e) {
			return null == e ? 0 : C(e) ? e.length : m.keys(e).length
		}, m.partition = function(e, t, n) {
			t = x(t, n);
			var r = [],
				i = [];
			return m.each(e, function(e, n, o) {
				(t(e, n, o) ? r : i).push(e)
			}), [r, i]
		}, m.first = m.head = m.take = function(e, t, n) {
			if (null != e) return null == t || n ? e[0] : m.initial(e, e.length - t)
		}, m.initial = function(e, t, n) {
			return c.call(e, 0, Math.max(0, e.length - (null == t || n ? 1 : t)))
		}, m.last = function(e, t, n) {
			if (null != e) return null == t || n ? e[e.length - 1] : m.rest(e, Math.max(0, e.length - t))
		}, m.rest = m.tail = m.drop = function(e, t, n) {
			return c.call(e, null == t || n ? 1 : t)
		}, m.compact = function(e) {
			return m.filter(e, m.identity)
		};
		var S = function(e, t, n, r) {
			for (var i = [], o = 0, s = r || 0, a = E(e); s < a; s++) {
				var u = e[s];
				if (C(u) && (m.isArray(u) || m.isArguments(u))) {
					t || (u = S(u, t, n));
					var l = 0,
						c = u.length;
					for (i.length += c; l < c;) i[o++] = u[l++]
				} else n || (i[o++] = u)
			}
			return i
		};
		m.flatten = function(e, t) {
			return S(e, t, !1)
		}, m.without = function(e) {
			return m.difference(e, c.call(arguments, 1))
		}, m.uniq = m.unique = function(e, t, n, r) {
			m.isBoolean(t) || (r = n, n = t, t = !1), null != n && (n = x(n, r));
			for (var i = [], o = [], s = 0, a = E(e); s < a; s++) {
				var u = e[s],
					l = n ? n(u, s, e) : u;
				t ? (s && o === l || i.push(u), o = l) : n ? m.contains(o, l) || (o.push(l), i.push(u)) : m.contains(i, u) || i.push(u)
			}
			return i
		}, m.union = function() {
			return m.uniq(S(arguments, !0, !0))
		}, m.intersection = function(e) {
			for (var t = [], n = arguments.length, r = 0, i = E(e); r < i; r++) {
				var o = e[r];
				if (!m.contains(t, o)) {
					for (var s = 1; s < n && m.contains(arguments[s], o); s++);
					s === n && t.push(o)
				}
			}
			return t
		}, m.difference = function(e) {
			var t = S(arguments, !0, !0, 1);
			return m.filter(e, function(e) {
				return !m.contains(t, e)
			})
		}, m.zip = function() {
			return m.unzip(arguments)
		}, m.unzip = function(e) {
			for (var t = e && m.max(e, E).length || 0, n = Array(t), r = 0; r < t; r++) n[r] = m.pluck(e, r);
			return n
		}, m.object = function(e, t) {
			for (var n = {}, r = 0, i = E(e); r < i; r++) t ? n[e[r]] = t[r] : n[e[r][0]] = e[r][1];
			return n
		}, m.findIndex = t(1), m.findLastIndex = t(-1), m.sortedIndex = function(e, t, n, r) {
			n = x(n, r, 1);
			for (var i = n(t), o = 0, s = E(e); o < s;) {
				var a = Math.floor((o + s) / 2);
				n(e[a]) < i ? o = a + 1 : s = a
			}
			return o
		}, m.indexOf = n(1, m.findIndex, m.sortedIndex), m.lastIndexOf = n(-1, m.findLastIndex), m.range = function(e, t, n) {
			null == t && (t = e || 0, e = 0), n = n || 1;
			for (var r = Math.max(Math.ceil((t - e) / n), 0), i = Array(r), o = 0; o < r; o++, e += n) i[o] = e;
			return i
		};
		var j = function(e, t, n, r, i) {
			if (!(r instanceof t)) return e.apply(n, i);
			var o = _(e.prototype),
				s = e.apply(o, i);
			return m.isObject(s) ? s : o
		};
		m.bind = function(e, t) {
			if (g && e.bind === g) return g.apply(e, c.call(arguments, 1));
			if (!m.isFunction(e)) throw new TypeError("Bind must be called on a function");
			var n = c.call(arguments, 2),
				r = function() {
					return j(e, r, t, this, n.concat(c.call(arguments)))
				};
			return r
		}, m.partial = function(e) {
			var t = c.call(arguments, 1),
				n = function() {
					for (var r = 0, i = t.length, o = Array(i), s = 0; s < i; s++) o[s] = t[s] === m ? arguments[r++] : t[s];
					for (; r < arguments.length;) o.push(arguments[r++]);
					return j(e, n, this, this, o)
				};
			return n
		}, m.bindAll = function(e) {
			var t, n, r = arguments.length;
			if (r <= 1) throw new Error("bindAll must be passed function names");
			for (t = 1; t < r; t++) n = arguments[t], e[n] = m.bind(e[n], e);
			return e
		}, m.memoize = function(e, t) {
			var n = function(r) {
				var i = n.cache,
					o = "" + (t ? t.apply(this, arguments) : r);
				return m.has(i, o) || (i[o] = e.apply(this, arguments)), i[o]
			};
			return n.cache = {}, n
		}, m.delay = function(e, t) {
			var n = c.call(arguments, 2);
			return setTimeout(function() {
				return e.apply(null, n)
			}, t)
		}, m.defer = m.partial(m.delay, m, 1), m.throttle = function(e, t, n) {
			var r, i, o, s = null,
				a = 0;
			n || (n = {});
			var u = function() {
				a = n.leading === !1 ? 0 : m.now(), s = null, o = e.apply(r, i), s || (r = i = null)
			};
			return function() {
				var l = m.now();
				a || n.leading !== !1 || (a = l);
				var c = t - (l - a);
				return r = this, i = arguments, c <= 0 || c > t ? (s && (clearTimeout(s), s = null), a = l, o = e.apply(r, i), s || (r = i = null)) : s || n.trailing === !1 || (s = setTimeout(u, c)), o
			}
		}, m.debounce = function(e, t, n) {
			var r, i, o, s, a, u = function() {
				var l = m.now() - s;
				l < t && l >= 0 ? r = setTimeout(u, t - l) : (r = null, n || (a = e.apply(o, i), r || (o = i = null)))
			};
			return function() {
				o = this, i = arguments, s = m.now();
				var l = n && !r;
				return r || (r = setTimeout(u, t)), l && (a = e.apply(o, i), o = i = null), a
			}
		}, m.wrap = function(e, t) {
			return m.partial(t, e)
		}, m.negate = function(e) {
			return function() {
				return !e.apply(this, arguments)
			}
		}, m.compose = function() {
			var e = arguments,
				t = e.length - 1;
			return function() {
				for (var n = t, r = e[t].apply(this, arguments); n--;) r = e[n].call(this, r);
				return r
			}
		}, m.after = function(e, t) {
			return function() {
				if (--e < 1) return t.apply(this, arguments)
			}
		}, m.before = function(e, t) {
			var n;
			return function() {
				return --e > 0 && (n = t.apply(this, arguments)), e <= 1 && (t = null), n
			}
		}, m.once = m.partial(m.before, 2);
		var O = !{
				toString: null
			}.propertyIsEnumerable("toString"),
			I = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
		m.keys = function(e) {
			if (!m.isObject(e)) return [];
			if (d) return d(e);
			var t = [];
			for (var n in e) m.has(e, n) && t.push(n);
			return O && r(e, t), t
		}, m.allKeys = function(e) {
			if (!m.isObject(e)) return [];
			var t = [];
			for (var n in e) t.push(n);
			return O && r(e, t), t
		}, m.values = function(e) {
			for (var t = m.keys(e), n = t.length, r = Array(n), i = 0; i < n; i++) r[i] = e[t[i]];
			return r
		}, m.mapObject = function(e, t, n) {
			t = x(t, n);
			for (var r, i = m.keys(e), o = i.length, s = {}, a = 0; a < o; a++) r = i[a], s[r] = t(e[r], r, e);
			return s
		}, m.pairs = function(e) {
			for (var t = m.keys(e), n = t.length, r = Array(n), i = 0; i < n; i++) r[i] = [t[i], e[t[i]]];
			return r
		}, m.invert = function(e) {
			for (var t = {}, n = m.keys(e), r = 0, i = n.length; r < i; r++) t[e[n[r]]] = n[r];
			return t
		}, m.functions = m.methods = function(e) {
			var t = [];
			for (var n in e) m.isFunction(e[n]) && t.push(n);
			return t.sort()
		}, m.extend = w(m.allKeys), m.extendOwn = m.assign = w(m.keys), m.findKey = function(e, t, n) {
			t = x(t, n);
			for (var r, i = m.keys(e), o = 0, s = i.length; o < s; o++)
				if (r = i[o], t(e[r], r, e)) return r
		}, m.pick = function(e, t, n) {
			var r, i, o = {},
				s = e;
			if (null == s) return o;
			m.isFunction(t) ? (i = m.allKeys(s), r = b(t, n)) : (i = S(arguments, !1, !1, 1), r = function(e, t, n) {
				return t in n
			}, s = Object(s));
			for (var a = 0, u = i.length; a < u; a++) {
				var l = i[a],
					c = s[l];
				r(c, l, s) && (o[l] = c)
			}
			return o
		}, m.omit = function(e, t, n) {
			if (m.isFunction(t)) t = m.negate(t);
			else {
				var r = m.map(S(arguments, !1, !1, 1), String);
				t = function(e, t) {
					return !m.contains(r, t)
				}
			}
			return m.pick(e, t, n)
		}, m.defaults = w(m.allKeys, !0), m.create = function(e, t) {
			var n = _(e);
			return t && m.extendOwn(n, t), n
		}, m.clone = function(e) {
			return m.isObject(e) ? m.isArray(e) ? e.slice() : m.extend({}, e) : e
		}, m.tap = function(e, t) {
			return t(e), e
		}, m.isMatch = function(e, t) {
			var n = m.keys(t),
				r = n.length;
			if (null == e) return !r;
			for (var i = Object(e), o = 0; o < r; o++) {
				var s = n[o];
				if (t[s] !== i[s] || !(s in i)) return !1
			}
			return !0
		};
		var R = function(e, t, n, r) {
			if (e === t) return 0 !== e || 1 / e === 1 / t;
			if (null == e || null == t) return e === t;
			e instanceof m && (e = e._wrapped), t instanceof m && (t = t._wrapped);
			var i = p.call(e);
			if (i !== p.call(t)) return !1;
			switch (i) {
				case "[object RegExp]":
				case "[object String]":
					return "" + e == "" + t;
				case "[object Number]":
					return +e !== +e ? +t !== +t : 0 === +e ? 1 / +e === 1 / t : +e === +t;
				case "[object Date]":
				case "[object Boolean]":
					return +e === +t
			}
			var o = "[object Array]" === i;
			if (!o) {
				if ("object" != typeof e || "object" != typeof t) return !1;
				var s = e.constructor,
					a = t.constructor;
				if (s !== a && !(m.isFunction(s) && s instanceof s && m.isFunction(a) && a instanceof a) && "constructor" in e && "constructor" in t) return !1
			}
			n = n || [], r = r || [];
			for (var u = n.length; u--;)
				if (n[u] === e) return r[u] === t;
			if (n.push(e), r.push(t), o) {
				if (u = e.length, u !== t.length) return !1;
				for (; u--;)
					if (!R(e[u], t[u], n, r)) return !1
			} else {
				var l, c = m.keys(e);
				if (u = c.length, m.keys(t).length !== u) return !1;
				for (; u--;)
					if (l = c[u], !m.has(t, l) || !R(e[l], t[l], n, r)) return !1
			}
			return n.pop(), r.pop(), !0
		};
		m.isEqual = function(e, t) {
			return R(e, t)
		}, m.isEmpty = function(e) {
			return null == e || (C(e) && (m.isArray(e) || m.isString(e) || m.isArguments(e)) ? 0 === e.length : 0 === m.keys(e).length)
		}, m.isElement = function(e) {
			return !(!e || 1 !== e.nodeType)
		}, m.isArray = h || function(e) {
			return "[object Array]" === p.call(e)
		}, m.isObject = function(e) {
			var t = typeof e;
			return "function" === t || "object" === t && !!e
		}, m.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function(e) {
			m["is" + e] = function(t) {
				return p.call(t) === "[object " + e + "]"
			}
		}), m.isArguments(arguments) || (m.isArguments = function(e) {
			return m.has(e, "callee")
		}), "function" != typeof /./ && "object" != typeof Int8Array && (m.isFunction = function(e) {
			return "function" == typeof e || !1
		}), m.isFinite = function(e) {
			return isFinite(e) && !isNaN(parseFloat(e))
		}, m.isNaN = function(e) {
			return m.isNumber(e) && e !== +e
		}, m.isBoolean = function(e) {
			return e === !0 || e === !1 || "[object Boolean]" === p.call(e)
		}, m.isNull = function(e) {
			return null === e
		}, m.isUndefined = function(e) {
			return void 0 === e
		}, m.has = function(e, t) {
			return null != e && f.call(e, t)
		}, m.noConflict = function() {
			return i._ = o, this
		}, m.identity = function(e) {
			return e
		}, m.constant = function(e) {
			return function() {
				return e
			}
		}, m.noop = function() {}, m.property = k, m.propertyOf = function(e) {
			return null == e ? function() {} : function(t) {
				return e[t]
			}
		}, m.matcher = m.matches = function(e) {
			return e = m.extendOwn({}, e),
				function(t) {
					return m.isMatch(t, e)
				}
		}, m.times = function(e, t, n) {
			var r = Array(Math.max(0, e));
			t = b(t, n, 1);
			for (var i = 0; i < e; i++) r[i] = t(i);
			return r
		}, m.random = function(e, t) {
			return null == t && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1))
		}, m.now = Date.now || function() {
			return (new Date).getTime()
		};
		var N = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#x27;",
				"`": "&#x60;"
			},
			$ = m.invert(N),
			D = function(e) {
				var t = function(t) {
						return e[t]
					},
					n = "(?:" + m.keys(e).join("|") + ")",
					r = RegExp(n),
					i = RegExp(n, "g");
				return function(e) {
					return e = null == e ? "" : "" + e, r.test(e) ? e.replace(i, t) : e
				}
			};
		m.escape = D(N), m.unescape = D($), m.result = function(e, t, n) {
			var r = null == e ? void 0 : e[t];
			return void 0 === r && (r = n), m.isFunction(r) ? r.call(e) : r
		};
		var M = 0;
		m.uniqueId = function(e) {
			var t = ++M + "";
			return e ? e + t : t
		}, m.templateSettings = {
			evaluate: /<%([\s\S]+?)%>/g,
			interpolate: /<%=([\s\S]+?)%>/g,
			escape: /<%-([\s\S]+?)%>/g
		};
		var L = /(.)^/,
			P = {
				"'": "'",
				"\\": "\\",
				"\r": "r",
				"\n": "n",
				"\u2028": "u2028",
				"\u2029": "u2029"
			},
			B = /\\|'|\r|\n|\u2028|\u2029/g,
			q = function(e) {
				return "\\" + P[e]
			};
		m.template = function(e, t, n) {
			!t && n && (t = n), t = m.defaults({}, t, m.templateSettings);
			var r = RegExp([(t.escape || L).source, (t.interpolate || L).source, (t.evaluate || L).source].join("|") + "|$", "g"),
				i = 0,
				o = "__p+='";
			e.replace(r, function(t, n, r, s, a) {
				return o += e.slice(i, a).replace(B, q), i = a + t.length, n ? o += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'" : r ? o += "'+\n((__t=(" + r + "))==null?'':__t)+\n'" : s && (o += "';\n" + s + "\n__p+='"), t
			}), o += "';\n", t.variable || (o = "with(obj||{}){\n" + o + "}\n"), o = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + o + "return __p;\n";
			try {
				var s = new Function(t.variable || "obj", "_", o)
			} catch (e) {
				throw e.source = o, e
			}
			var a = function(e) {
					return s.call(this, e, m)
				},
				u = t.variable || "obj";
			return a.source = "function(" + u + "){\n" + o + "}", a
		}, m.chain = function(e) {
			var t = m(e);
			return t._chain = !0, t
		};
		var F = function(e, t) {
			return e._chain ? m(t).chain() : t
		};
		m.mixin = function(e) {
			m.each(m.functions(e), function(t) {
				var n = m[t] = e[t];
				m.prototype[t] = function() {
					var e = [this._wrapped];
					return l.apply(e, arguments), F(this, n.apply(m, e))
				}
			})
		}, m.mixin(m), m.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(e) {
			var t = s[e];
			m.prototype[e] = function() {
				var n = this._wrapped;
				return t.apply(n, arguments), "shift" !== e && "splice" !== e || 0 !== n.length || delete n[0], F(this, n)
			}
		}), m.each(["concat", "join", "slice"], function(e) {
			var t = s[e];
			m.prototype[e] = function() {
				return F(this, t.apply(this._wrapped, arguments))
			}
		}), m.prototype.value = function() {
			return this._wrapped
		}, m.prototype.valueOf = m.prototype.toJSON = m.prototype.value, m.prototype.toString = function() {
			return "" + this._wrapped
		}, "function" == typeof define && define.amd && define("underscore", [], function() {
			return m
		})
	}.call(this), function(e, t) {
		"use strict";
		"object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function(e) {
			if (!e.document) throw new Error("jQuery requires a window with a document");
			return t(e)
		} : t(e)
	}("undefined" != typeof window ? window : this, function(e, t) {
		function n(e, t) {
			t = t || te;
			var n = t.createElement("script");
			n.text = e, t.head.appendChild(n).parentNode.removeChild(n)
		}

		function r(e) {
			var t = !!e && "length" in e && e.length,
				n = de.type(e);
			return "function" !== n && !de.isWindow(e) && ("array" === n || 0 === t || "number" == typeof t && t > 0 && t - 1 in e)
		}

		function i(e, t, n) {
			return de.isFunction(t) ? de.grep(e, function(e, r) {
				return !!t.call(e, r, e) !== n
			}) : t.nodeType ? de.grep(e, function(e) {
				return e === t !== n
			}) : "string" != typeof t ? de.grep(e, function(e) {
				return se.call(t, e) > -1 !== n
			}) : Te.test(t) ? de.filter(t, e, n) : (t = de.filter(t, e), de.grep(e, function(e) {
				return se.call(t, e) > -1 !== n && 1 === e.nodeType
			}))
		}

		function o(e, t) {
			for (;
				(e = e[t]) && 1 !== e.nodeType;);
			return e
		}

		function s(e) {
			var t = {};
			return de.each(e.match(Oe) || [], function(e, n) {
				t[n] = !0
			}), t
		}

		function a(e) {
			return e
		}

		function u(e) {
			throw e
		}

		function l(e, t, n) {
			var r;
			try {
				e && de.isFunction(r = e.promise) ? r.call(e).done(t).fail(n) : e && de.isFunction(r = e.then) ? r.call(e, t, n) : t.call(void 0, e)
			} catch (e) {
				n.call(void 0, e)
			}
		}

		function c() {
			te.removeEventListener("DOMContentLoaded", c), e.removeEventListener("load", c), de.ready()
		}

		function p() {
			this.expando = de.expando + p.uid++
		}

		function f(e) {
			return "true" === e || "false" !== e && ("null" === e ? null : e === +e + "" ? +e : Le.test(e) ? JSON.parse(e) : e)
		}

		function h(e, t, n) {
			var r;
			if (void 0 === n && 1 === e.nodeType)
				if (r = "data-" + t.replace(Pe, "-'{{MAIN_SCRIPT}}'").toLowerCase(), n = e.getAttribute(r), "string" == typeof n) {
					try {
						n = f(n)
					} catch (e) {}
					Me.set(e, t, n)
				} else n = void 0;
			return n
		}

		function d(e, t, n, r) {
			var i, o = 1,
				s = 20,
				a = r ? function() {
					return r.cur()
				} : function() {
					return de.css(e, t, "")
				},
				u = a(),
				l = n && n[3] || (de.cssNumber[t] ? "" : "px"),
				c = (de.cssNumber[t] || "px" !== l && +u) && qe.exec(de.css(e, t));
			if (c && c[3] !== l) {
				l = l || c[3], n = n || [], c = +u || 1;
				do o = o || ".5", c /= o, de.style(e, t, c + l); while (o !== (o = a() / u) && 1 !== o && --s)
			}
			return n && (c = +c || +u || 0, i = n[1] ? c + (n[1] + 1) * n[2] : +n[2], r && (r.unit = l, r.start = c, r.end = i)), i
		}

		function g(e) {
			var t, n = e.ownerDocument,
				r = e.nodeName,
				i = ze[r];
			return i ? i : (t = n.body.appendChild(n.createElement(r)), i = de.css(t, "display"), t.parentNode.removeChild(t), "none" === i && (i = "block"), ze[r] = i, i)
		}

		function v(e, t) {
			for (var n, r, i = [], o = 0, s = e.length; o < s; o++) r = e[o], r.style && (n = r.style.display, t ? ("none" === n && (i[o] = De.get(r, "display") || null, i[o] || (r.style.display = "")), "" === r.style.display && Ve(r) && (i[o] = g(r))) : "none" !== n && (i[o] = "none", De.set(r, "display", n)));
			for (o = 0; o < s; o++) null != i[o] && (e[o].style.display = i[o]);
			return e
		}

		function y(e, t) {
			var n;
			return n = "undefined" != typeof e.getElementsByTagName ? e.getElementsByTagName(t || "*") : "undefined" != typeof e.querySelectorAll ? e.querySelectorAll(t || "*") : [], void 0 === t || t && de.nodeName(e, t) ? de.merge([e], n) : n
		}

		function m(e, t) {
			for (var n = 0, r = e.length; n < r; n++) De.set(e[n], "globalEval", !t || De.get(t[n], "globalEval"))
		}

		function b(e, t, n, r, i) {
			for (var o, s, a, u, l, c, p = t.createDocumentFragment(), f = [], h = 0, d = e.length; h < d; h++)
				if (o = e[h], o || 0 === o)
					if ("object" === de.type(o)) de.merge(f, o.nodeType ? [o] : o);
					else if (Ze.test(o)) {
				for (s = s || p.appendChild(t.createElement("div")), a = (We.exec(o) || ["", ""])[1].toLowerCase(), u = Je[a] || Je._default, s.innerHTML = u[1] + de.htmlPrefilter(o) + u[2], c = u[0]; c--;) s = s.lastChild;
				de.merge(f, s.childNodes), s = p.firstChild, s.textContent = ""
			} else f.push(t.createTextNode(o));
			for (p.textContent = "", h = 0; o = f[h++];)
				if (r && de.inArray(o, r) > -1) i && i.push(o);
				else if (l = de.contains(o.ownerDocument, o), s = y(p.appendChild(o), "script"), l && m(s), n)
				for (c = 0; o = s[c++];) Ge.test(o.type || "") && n.push(o);
			return p
		}

		function x() {
			return !0
		}

		function w() {
			return !1
		}

		function _() {
			try {
				return te.activeElement
			} catch (e) {}
		}

		function k(e, t, n, r, i, o) {
			var s, a;
			if ("object" == typeof t) {
				"string" != typeof n && (r = r || n, n = void 0);
				for (a in t) k(e, a, n, r, t[a], o);
				return e
			}
			if (null == r && null == i ? (i = n, r = n = void 0) : null == i && ("string" == typeof n ? (i = r, r = void 0) : (i = r, r = n, n = void 0)), i === !1) i = w;
			else if (!i) return e;
			return 1 === o && (s = i, i = function(e) {
				return de().off(e), s.apply(this, arguments)
			}, i.guid = s.guid || (s.guid = de.guid++)), e.each(function() {
				de.event.add(this, t, i, r, n)
			})
		}

		function T(e, t) {
			return de.nodeName(e, "table") && de.nodeName(11 !== t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e : e
		}

		function E(e) {
			return e.type = (null !== e.getAttribute("type")) + "/" + e.type, e
		}

		function C(e) {
			var t = rt.exec(e.type);
			return t ? e.type = t[1] : e.removeAttribute("type"), e
		}

		function A(e, t) {
			var n, r, i, o, s, a, u, l;
			if (1 === t.nodeType) {
				if (De.hasData(e) && (o = De.access(e), s = De.set(t, o), l = o.events)) {
					delete s.handle, s.events = {};
					for (i in l)
						for (n = 0, r = l[i].length; n < r; n++) de.event.add(t, i, l[i][n])
				}
				Me.hasData(e) && (a = Me.access(e), u = de.extend({}, a), Me.set(t, u))
			}
		}

		function S(e, t) {
			var n = t.nodeName.toLowerCase();
			"input" === n && He.test(e.type) ? t.checked = e.checked : "input" !== n && "textarea" !== n || (t.defaultValue = e.defaultValue)
		}

		function j(e, t, r, i) {
			t = ie.apply([], t);
			var o, s, a, u, l, c, p = 0,
				f = e.length,
				h = f - 1,
				d = t[0],
				g = de.isFunction(d);
			if (g || f > 1 && "string" == typeof d && !fe.checkClone && nt.test(d)) return e.each(function(n) {
				var o = e.eq(n);
				g && (t[0] = d.call(this, n, o.html())), j(o, t, r, i)
			});
			if (f && (o = b(t, e[0].ownerDocument, !1, e, i), s = o.firstChild, 1 === o.childNodes.length && (o = s), s || i)) {
				for (a = de.map(y(o, "script"), E), u = a.length; p < f; p++) l = o, p !== h && (l = de.clone(l, !0, !0), u && de.merge(a, y(l, "script"))), r.call(e[p], l, p);
				if (u)
					for (c = a[a.length - 1].ownerDocument, de.map(a, C), p = 0; p < u; p++) l = a[p], Ge.test(l.type || "") && !De.access(l, "globalEval") && de.contains(c, l) && (l.src ? de._evalUrl && de._evalUrl(l.src) : n(l.textContent.replace(it, ""), c))
			}
			return e
		}

		function O(e, t, n) {
			for (var r, i = t ? de.filter(t, e) : e, o = 0; null != (r = i[o]); o++) n || 1 !== r.nodeType || de.cleanData(y(r)), r.parentNode && (n && de.contains(r.ownerDocument, r) && m(y(r, "script")), r.parentNode.removeChild(r));
			return e
		}

		function I(e, t, n) {
			var r, i, o, s, a = e.style;
			return n = n || at(e), n && (s = n.getPropertyValue(t) || n[t], "" !== s || de.contains(e.ownerDocument, e) || (s = de.style(e, t)), !fe.pixelMarginRight() && st.test(s) && ot.test(t) && (r = a.width, i = a.minWidth, o = a.maxWidth, a.minWidth = a.maxWidth = a.width = s, s = n.width, a.width = r, a.minWidth = i, a.maxWidth = o)), void 0 !== s ? s + "" : s
		}

		function R(e, t) {
			return {
				get: function() {
					return e() ? void delete this.get : (this.get = t).apply(this, arguments)
				}
			}
		}

		function N(e) {
			if (e in ft) return e;
			for (var t = e[0].toUpperCase() + e.slice(1), n = pt.length; n--;)
				if (e = pt[n] + t, e in ft) return e
		}

		function $(e, t, n) {
			var r = qe.exec(t);
			return r ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px") : t
		}

		function D(e, t, n, r, i) {
			var o, s = 0;
			for (o = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0; o < 4; o += 2) "margin" === n && (s += de.css(e, n + Fe[o], !0, i)), r ? ("content" === n && (s -= de.css(e, "padding" + Fe[o], !0, i)), "margin" !== n && (s -= de.css(e, "border" + Fe[o] + "Width", !0, i))) : (s += de.css(e, "padding" + Fe[o], !0, i), "padding" !== n && (s += de.css(e, "border" + Fe[o] + "Width", !0, i)));
			return s
		}

		function M(e, t, n) {
			var r, i = !0,
				o = at(e),
				s = "border-box" === de.css(e, "boxSizing", !1, o);
			if (e.getClientRects().length && (r = e.getBoundingClientRect()[t]), r <= 0 || null == r) {
				if (r = I(e, t, o), (r < 0 || null == r) && (r = e.style[t]), st.test(r)) return r;
				i = s && (fe.boxSizingReliable() || r === e.style[t]), r = parseFloat(r) || 0
			}
			return r + D(e, t, n || (s ? "border" : "content"), i, o) + "px"
		}

		function L(e, t, n, r, i) {
			return new L.prototype.init(e, t, n, r, i)
		}

		function P() {
			dt && (e.requestAnimationFrame(P), de.fx.tick())
		}

		function B() {
			return e.setTimeout(function() {
				ht = void 0
			}), ht = de.now()
		}

		function q(e, t) {
			var n, r = 0,
				i = {
					height: e
				};
			for (t = t ? 1 : 0; r < 4; r += 2 - t) n = Fe[r], i["margin" + n] = i["padding" + n] = e;
			return t && (i.opacity = i.width = e), i
		}

		function F(e, t, n) {
			for (var r, i = (z.tweeners[t] || []).concat(z.tweeners["*"]), o = 0, s = i.length; o < s; o++)
				if (r = i[o].call(n, t, e)) return r
		}

		function V(e, t, n) {
			var r, i, o, s, a, u, l, c, p = "width" in t || "height" in t,
				f = this,
				h = {},
				d = e.style,
				g = e.nodeType && Ve(e),
				y = De.get(e, "fxshow");
			n.queue || (s = de._queueHooks(e, "fx"), null == s.unqueued && (s.unqueued = 0, a = s.empty.fire, s.empty.fire = function() {
				s.unqueued || a()
			}), s.unqueued++, f.always(function() {
				f.always(function() {
					s.unqueued--, de.queue(e, "fx").length || s.empty.fire()
				})
			}));
			for (r in t)
				if (i = t[r], gt.test(i)) {
					if (delete t[r], o = o || "toggle" === i, i === (g ? "hide" : "show")) {
						if ("show" !== i || !y || void 0 === y[r]) continue;
						g = !0
					}
					h[r] = y && y[r] || de.style(e, r)
				}
			if (u = !de.isEmptyObject(t), u || !de.isEmptyObject(h)) {
				p && 1 === e.nodeType && (n.overflow = [d.overflow, d.overflowX, d.overflowY], l = y && y.display, null == l && (l = De.get(e, "display")), c = de.css(e, "display"), "none" === c && (l ? c = l : (v([e], !0), l = e.style.display || l, c = de.css(e, "display"), v([e]))), ("inline" === c || "inline-block" === c && null != l) && "none" === de.css(e, "float") && (u || (f.done(function() {
					d.display = l
				}), null == l && (c = d.display, l = "none" === c ? "" : c)), d.display = "inline-block")), n.overflow && (d.overflow = "hidden", f.always(function() {
					d.overflow = n.overflow[0], d.overflowX = n.overflow[1], d.overflowY = n.overflow[2]
				})), u = !1;
				for (r in h) u || (y ? "hidden" in y && (g = y.hidden) : y = De.access(e, "fxshow", {
					display: l
				}), o && (y.hidden = !g), g && v([e], !0), f.done(function() {
					g || v([e]), De.remove(e, "fxshow");
					for (r in h) de.style(e, r, h[r])
				})), u = F(g ? y[r] : 0, r, f), r in y || (y[r] = u.start, g && (u.end = u.start, u.start = 0))
			}
		}

		function U(e, t) {
			var n, r, i, o, s;
			for (n in e)
				if (r = de.camelCase(n), i = t[r], o = e[n], de.isArray(o) && (i = o[1], o = e[n] = o[0]), n !== r && (e[r] = o, delete e[n]), s = de.cssHooks[r], s && "expand" in s) {
					o = s.expand(o), delete e[r];
					for (n in o) n in e || (e[n] = o[n], t[n] = i)
				} else t[r] = i
		}

		function z(e, t, n) {
			var r, i, o = 0,
				s = z.prefilters.length,
				a = de.Deferred().always(function() {
					delete u.elem
				}),
				u = function() {
					if (i) return !1;
					for (var t = ht || B(), n = Math.max(0, l.startTime + l.duration - t), r = n / l.duration || 0, o = 1 - r, s = 0, u = l.tweens.length; s < u; s++) l.tweens[s].run(o);
					return a.notifyWith(e, [l, o, n]), o < 1 && u ? n : (a.resolveWith(e, [l]), !1)
				},
				l = a.promise({
					elem: e,
					props: de.extend({}, t),
					opts: de.extend(!0, {
						specialEasing: {},
						easing: de.easing._default
					}, n),
					originalProperties: t,
					originalOptions: n,
					startTime: ht || B(),
					duration: n.duration,
					tweens: [],
					createTween: function(t, n) {
						var r = de.Tween(e, l.opts, t, n, l.opts.specialEasing[t] || l.opts.easing);
						return l.tweens.push(r), r
					},
					stop: function(t) {
						var n = 0,
							r = t ? l.tweens.length : 0;
						if (i) return this;
						for (i = !0; n < r; n++) l.tweens[n].run(1);
						return t ? (a.notifyWith(e, [l, 1, 0]), a.resolveWith(e, [l, t])) : a.rejectWith(e, [l, t]), this
					}
				}),
				c = l.props;
			for (U(c, l.opts.specialEasing); o < s; o++)
				if (r = z.prefilters[o].call(l, e, c, l.opts)) return de.isFunction(r.stop) && (de._queueHooks(l.elem, l.opts.queue).stop = de.proxy(r.stop, r)), r;
			return de.map(c, F, l), de.isFunction(l.opts.start) && l.opts.start.call(e, l), de.fx.timer(de.extend(u, {
				elem: e,
				anim: l,
				queue: l.opts.queue
			})), l.progress(l.opts.progress).done(l.opts.done, l.opts.complete).fail(l.opts.fail).always(l.opts.always)
		}

		function H(e) {
			var t = e.match(Oe) || [];
			return t.join(" ")
		}

		function W(e) {
			return e.getAttribute && e.getAttribute("class") || ""
		}

		function G(e, t, n, r) {
			var i;
			if (de.isArray(t)) de.each(t, function(t, i) {
				n || Ct.test(e) ? r(e, i) : G(e + "[" + ("object" == typeof i && null != i ? t : "") + "]", i, n, r)
			});
			else if (n || "object" !== de.type(t)) r(e, t);
			else
				for (i in t) G(e + "[" + i + "]", t[i], n, r)
		}

		function J(e) {
			return function(t, n) {
				"string" != typeof t && (n = t, t = "*");
				var r, i = 0,
					o = t.toLowerCase().match(Oe) || [];
				if (de.isFunction(n))
					for (; r = o[i++];) "+" === r[0] ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
			}
		}

		function Z(e, t, n, r) {
			function i(a) {
				var u;
				return o[a] = !0, de.each(e[a] || [], function(e, a) {
					var l = a(t, n, r);
					return "string" != typeof l || s || o[l] ? s ? !(u = l) : void 0 : (t.dataTypes.unshift(l), i(l), !1)
				}), u
			}
			var o = {},
				s = e === Pt;
			return i(t.dataTypes[0]) || !o["*"] && i("*")
		}

		function Y(e, t) {
			var n, r, i = de.ajaxSettings.flatOptions || {};
			for (n in t) void 0 !== t[n] && ((i[n] ? e : r || (r = {}))[n] = t[n]);
			return r && de.extend(!0, e, r), e
		}

		function X(e, t, n) {
			for (var r, i, o, s, a = e.contents, u = e.dataTypes;
				"*" === u[0];) u.shift(), void 0 === r && (r = e.mimeType || t.getResponseHeader("Content-Type"));
			if (r)
				for (i in a)
					if (a[i] && a[i].test(r)) {
						u.unshift(i);
						break
					}
			if (u[0] in n) o = u[0];
			else {
				for (i in n) {
					if (!u[0] || e.converters[i + " " + u[0]]) {
						o = i;
						break
					}
					s || (s = i)
				}
				o = o || s
			}
			if (o) return o !== u[0] && u.unshift(o), n[o]
		}

		function K(e, t, n, r) {
			var i, o, s, a, u, l = {},
				c = e.dataTypes.slice();
			if (c[1])
				for (s in e.converters) l[s.toLowerCase()] = e.converters[s];
			for (o = c.shift(); o;)
				if (e.responseFields[o] && (n[e.responseFields[o]] = t), !u && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), u = o, o = c.shift())
					if ("*" === o) o = u;
					else if ("*" !== u && u !== o) {
				if (s = l[u + " " + o] || l["* " + o], !s)
					for (i in l)
						if (a = i.split(" "), a[1] === o && (s = l[u + " " + a[0]] || l["* " + a[0]])) {
							s === !0 ? s = l[i] : l[i] !== !0 && (o = a[0], c.unshift(a[1]));
							break
						}
				if (s !== !0)
					if (s && e.throws) t = s(t);
					else try {
						t = s(t)
					} catch (e) {
						return {
							state: "parsererror",
							error: s ? e : "No conversion from " + u + " to " + o
						}
					}
			}
			return {
				state: "success",
				data: t
			}
		}

		function Q(e) {
			return de.isWindow(e) ? e : 9 === e.nodeType && e.defaultView
		}
		var ee = [],
			te = e.document,
			ne = Object.getPrototypeOf,
			re = ee.slice,
			ie = ee.concat,
			oe = ee.push,
			se = ee.indexOf,
			ae = {},
			ue = ae.toString,
			le = ae.hasOwnProperty,
			ce = le.toString,
			pe = ce.call(Object),
			fe = {},
			he = "3.1.1",
			de = function(e, t) {
				return new de.fn.init(e, t)
			},
			ge = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
			ve = /^-ms-/,
			ye = /-([a-z])/g,
			me = function(e, t) {
				return t.toUpperCase()
			};
		de.fn = de.prototype = {
				jquery: he,
				constructor: de,
				length: 0,
				toArray: function() {
					return re.call(this)
				},
				get: function(e) {
					return null == e ? re.call(this) : e < 0 ? this[e + this.length] : this[e]
				},
				pushStack: function(e) {
					var t = de.merge(this.constructor(), e);
					return t.prevObject = this, t
				},
				each: function(e) {
					return de.each(this, e)
				},
				map: function(e) {
					return this.pushStack(de.map(this, function(t, n) {
						return e.call(t, n, t)
					}))
				},
				slice: function() {
					return this.pushStack(re.apply(this, arguments))
				},
				first: function() {
					return this.eq(0)
				},
				last: function() {
					return this.eq(-1)
				},
				eq: function(e) {
					var t = this.length,
						n = +e + (e < 0 ? t : 0);
					return this.pushStack(n >= 0 && n < t ? [this[n]] : [])
				},
				end: function() {
					return this.prevObject || this.constructor()
				},
				push: oe,
				sort: ee.sort,
				splice: ee.splice
			}, de.extend = de.fn.extend = function() {
				var e, t, n, r, i, o, s = arguments[0] || {},
					a = 1,
					u = arguments.length,
					l = !1;
				for ("boolean" == typeof s && (l = s, s = arguments[a] || {}, a++), "object" == typeof s || de.isFunction(s) || (s = {}), a === u && (s = this, a--); a < u; a++)
					if (null != (e = arguments[a]))
						for (t in e) n = s[t], r = e[t], s !== r && (l && r && (de.isPlainObject(r) || (i = de.isArray(r))) ? (i ? (i = !1, o = n && de.isArray(n) ? n : []) : o = n && de.isPlainObject(n) ? n : {}, s[t] = de.extend(l, o, r)) : void 0 !== r && (s[t] = r));
				return s
			}, de.extend({
				expando: "jQuery" + (he + Math.random()).replace(/\D/g, ""),
				isReady: !0,
				error: function(e) {
					throw new Error(e)
				},
				noop: function() {},
				isFunction: function(e) {
					return "function" === de.type(e)
				},
				isArray: Array.isArray,
				isWindow: function(e) {
					return null != e && e === e.window
				},
				isNumeric: function(e) {
					var t = de.type(e);
					return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e))
				},
				isPlainObject: function(e) {
					var t, n;
					return !(!e || "[object Object]" !== ue.call(e) || (t = ne(e)) && (n = le.call(t, "constructor") && t.constructor, "function" != typeof n || ce.call(n) !== pe))
				},
				isEmptyObject: function(e) {
					var t;
					for (t in e) return !1;
					return !0
				},
				type: function(e) {
					return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? ae[ue.call(e)] || "object" : typeof e
				},
				globalEval: function(e) {
					n(e)
				},
				camelCase: function(e) {
					return e.replace(ve, "ms-").replace(ye, me)
				},
				nodeName: function(e, t) {
					return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
				},
				each: function(e, t) {
					var n, i = 0;
					if (r(e))
						for (n = e.length; i < n && t.call(e[i], i, e[i]) !== !1; i++);
					else
						for (i in e)
							if (t.call(e[i], i, e[i]) === !1) break;
					return e
				},
				trim: function(e) {
					return null == e ? "" : (e + "").replace(ge, "")
				},
				makeArray: function(e, t) {
					var n = t || [];
					return null != e && (r(Object(e)) ? de.merge(n, "string" == typeof e ? [e] : e) : oe.call(n, e)), n
				},
				inArray: function(e, t, n) {
					return null == t ? -1 : se.call(t, e, n)
				},
				merge: function(e, t) {
					for (var n = +t.length, r = 0, i = e.length; r < n; r++) e[i++] = t[r];
					return e.length = i, e
				},
				grep: function(e, t, n) {
					for (var r, i = [], o = 0, s = e.length, a = !n; o < s; o++) r = !t(e[o], o), r !== a && i.push(e[o]);
					return i
				},
				map: function(e, t, n) {
					var i, o, s = 0,
						a = [];
					if (r(e))
						for (i = e.length; s < i; s++) o = t(e[s], s, n), null != o && a.push(o);
					else
						for (s in e) o = t(e[s], s, n), null != o && a.push(o);
					return ie.apply([], a)
				},
				guid: 1,
				proxy: function(e, t) {
					var n, r, i;
					if ("string" == typeof t && (n = e[t], t = e, e = n), de.isFunction(e)) return r = re.call(arguments, 2), i = function() {
						return e.apply(t || this, r.concat(re.call(arguments)))
					}, i.guid = e.guid = e.guid || de.guid++, i
				},
				now: Date.now,
				support: fe
			}), "function" == typeof Symbol && (de.fn[Symbol.iterator] = ee[Symbol.iterator]),
			de.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(e, t) {
				ae["[object " + t + "]"] = t.toLowerCase()
			});
		var be = function(e) {
			function t(e, t, n, r) {
				var i, o, s, a, u, l, c, f = t && t.ownerDocument,
					d = t ? t.nodeType : 9;
				if (n = n || [], "string" != typeof e || !e || 1 !== d && 9 !== d && 11 !== d) return n;
				if (!r && ((t ? t.ownerDocument || t : F) !== N && R(t), t = t || N, D)) {
					if (11 !== d && (u = ye.exec(e)))
						if (i = u[1]) {
							if (9 === d) {
								if (!(s = t.getElementById(i))) return n;
								if (s.id === i) return n.push(s), n
							} else if (f && (s = f.getElementById(i)) && B(t, s) && s.id === i) return n.push(s), n
						} else {
							if (u[2]) return K.apply(n, t.getElementsByTagName(e)), n;
							if ((i = u[3]) && _.getElementsByClassName && t.getElementsByClassName) return K.apply(n, t.getElementsByClassName(i)), n
						}
					if (_.qsa && !W[e + " "] && (!M || !M.test(e))) {
						if (1 !== d) f = t, c = e;
						else if ("object" !== t.nodeName.toLowerCase()) {
							for ((a = t.getAttribute("id")) ? a = a.replace(we, _e) : t.setAttribute("id", a = q), l = C(e), o = l.length; o--;) l[o] = "#" + a + " " + h(l[o]);
							c = l.join(","), f = me.test(e) && p(t.parentNode) || t
						}
						if (c) try {
							return K.apply(n, f.querySelectorAll(c)), n
						} catch (e) {} finally {
							a === q && t.removeAttribute("id")
						}
					}
				}
				return S(e.replace(ae, "$1"), t, n, r)
			}

			function n() {
				function e(n, r) {
					return t.push(n + " ") > k.cacheLength && delete e[t.shift()], e[n + " "] = r
				}
				var t = [];
				return e
			}

			function r(e) {
				return e[q] = !0, e
			}

			function i(e) {
				var t = N.createElement("fieldset");
				try {
					return !!e(t)
				} catch (e) {
					return !1
				} finally {
					t.parentNode && t.parentNode.removeChild(t), t = null
				}
			}

			function o(e, t) {
				for (var n = e.split("|"), r = n.length; r--;) k.attrHandle[n[r]] = t
			}

			function s(e, t) {
				var n = t && e,
					r = n && 1 === e.nodeType && 1 === t.nodeType && e.sourceIndex - t.sourceIndex;
				if (r) return r;
				if (n)
					for (; n = n.nextSibling;)
						if (n === t) return -1;
				return e ? 1 : -1
			}

			function a(e) {
				return function(t) {
					var n = t.nodeName.toLowerCase();
					return "input" === n && t.type === e
				}
			}

			function u(e) {
				return function(t) {
					var n = t.nodeName.toLowerCase();
					return ("input" === n || "button" === n) && t.type === e
				}
			}

			function l(e) {
				return function(t) {
					return "form" in t ? t.parentNode && t.disabled === !1 ? "label" in t ? "label" in t.parentNode ? t.parentNode.disabled === e : t.disabled === e : t.isDisabled === e || t.isDisabled !== !e && Te(t) === e : t.disabled === e : "label" in t && t.disabled === e
				}
			}

			function c(e) {
				return r(function(t) {
					return t = +t, r(function(n, r) {
						for (var i, o = e([], n.length, t), s = o.length; s--;) n[i = o[s]] && (n[i] = !(r[i] = n[i]))
					})
				})
			}

			function p(e) {
				return e && "undefined" != typeof e.getElementsByTagName && e
			}

			function f() {}

			function h(e) {
				for (var t = 0, n = e.length, r = ""; t < n; t++) r += e[t].value;
				return r
			}

			function d(e, t, n) {
				var r = t.dir,
					i = t.next,
					o = i || r,
					s = n && "parentNode" === o,
					a = U++;
				return t.first ? function(t, n, i) {
					for (; t = t[r];)
						if (1 === t.nodeType || s) return e(t, n, i);
					return !1
				} : function(t, n, u) {
					var l, c, p, f = [V, a];
					if (u) {
						for (; t = t[r];)
							if ((1 === t.nodeType || s) && e(t, n, u)) return !0
					} else
						for (; t = t[r];)
							if (1 === t.nodeType || s)
								if (p = t[q] || (t[q] = {}), c = p[t.uniqueID] || (p[t.uniqueID] = {}), i && i === t.nodeName.toLowerCase()) t = t[r] || t;
								else {
									if ((l = c[o]) && l[0] === V && l[1] === a) return f[2] = l[2];
									if (c[o] = f, f[2] = e(t, n, u)) return !0
								} return !1
				}
			}

			function g(e) {
				return e.length > 1 ? function(t, n, r) {
					for (var i = e.length; i--;)
						if (!e[i](t, n, r)) return !1;
					return !0
				} : e[0]
			}

			function v(e, n, r) {
				for (var i = 0, o = n.length; i < o; i++) t(e, n[i], r);
				return r
			}

			function y(e, t, n, r, i) {
				for (var o, s = [], a = 0, u = e.length, l = null != t; a < u; a++)(o = e[a]) && (n && !n(o, r, i) || (s.push(o), l && t.push(a)));
				return s
			}

			function m(e, t, n, i, o, s) {
				return i && !i[q] && (i = m(i)), o && !o[q] && (o = m(o, s)), r(function(r, s, a, u) {
					var l, c, p, f = [],
						h = [],
						d = s.length,
						g = r || v(t || "*", a.nodeType ? [a] : a, []),
						m = !e || !r && t ? g : y(g, f, e, a, u),
						b = n ? o || (r ? e : d || i) ? [] : s : m;
					if (n && n(m, b, a, u), i)
						for (l = y(b, h), i(l, [], a, u), c = l.length; c--;)(p = l[c]) && (b[h[c]] = !(m[h[c]] = p));
					if (r) {
						if (o || e) {
							if (o) {
								for (l = [], c = b.length; c--;)(p = b[c]) && l.push(m[c] = p);
								o(null, b = [], l, u)
							}
							for (c = b.length; c--;)(p = b[c]) && (l = o ? ee(r, p) : f[c]) > -1 && (r[l] = !(s[l] = p))
						}
					} else b = y(b === s ? b.splice(d, b.length) : b), o ? o(null, s, b, u) : K.apply(s, b)
				})
			}

			function b(e) {
				for (var t, n, r, i = e.length, o = k.relative[e[0].type], s = o || k.relative[" "], a = o ? 1 : 0, u = d(function(e) {
						return e === t
					}, s, !0), l = d(function(e) {
						return ee(t, e) > -1
					}, s, !0), c = [function(e, n, r) {
						var i = !o && (r || n !== j) || ((t = n).nodeType ? u(e, n, r) : l(e, n, r));
						return t = null, i
					}]; a < i; a++)
					if (n = k.relative[e[a].type]) c = [d(g(c), n)];
					else {
						if (n = k.filter[e[a].type].apply(null, e[a].matches), n[q]) {
							for (r = ++a; r < i && !k.relative[e[r].type]; r++);
							return m(a > 1 && g(c), a > 1 && h(e.slice(0, a - 1).concat({
								value: " " === e[a - 2].type ? "*" : ""
							})).replace(ae, "$1"), n, a < r && b(e.slice(a, r)), r < i && b(e = e.slice(r)), r < i && h(e))
						}
						c.push(n)
					}
				return g(c)
			}

			function x(e, n) {
				var i = n.length > 0,
					o = e.length > 0,
					s = function(r, s, a, u, l) {
						var c, p, f, h = 0,
							d = "0",
							g = r && [],
							v = [],
							m = j,
							b = r || o && k.find.TAG("*", l),
							x = V += null == m ? 1 : Math.random() || .1,
							w = b.length;
						for (l && (j = s === N || s || l); d !== w && null != (c = b[d]); d++) {
							if (o && c) {
								for (p = 0, s || c.ownerDocument === N || (R(c), a = !D); f = e[p++];)
									if (f(c, s || N, a)) {
										u.push(c);
										break
									}
								l && (V = x)
							}
							i && ((c = !f && c) && h--, r && g.push(c))
						}
						if (h += d, i && d !== h) {
							for (p = 0; f = n[p++];) f(g, v, s, a);
							if (r) {
								if (h > 0)
									for (; d--;) g[d] || v[d] || (v[d] = Y.call(u));
								v = y(v)
							}
							K.apply(u, v), l && !r && v.length > 0 && h + n.length > 1 && t.uniqueSort(u)
						}
						return l && (V = x, j = m), g
					};
				return i ? r(s) : s
			}
			var w, _, k, T, E, C, A, S, j, O, I, R, N, $, D, M, L, P, B, q = "sizzle" + 1 * new Date,
				F = e.document,
				V = 0,
				U = 0,
				z = n(),
				H = n(),
				W = n(),
				G = function(e, t) {
					return e === t && (I = !0), 0
				},
				J = {}.hasOwnProperty,
				Z = [],
				Y = Z.pop,
				X = Z.push,
				K = Z.push,
				Q = Z.slice,
				ee = function(e, t) {
					for (var n = 0, r = e.length; n < r; n++)
						if (e[n] === t) return n;
					return -1
				},
				te = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
				ne = "[\\x20\\t\\r\\n\\f]",
				re = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
				ie = "\\[" + ne + "*(" + re + ")(?:" + ne + "*([*^$|!~]?=)" + ne + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + re + "))|)" + ne + "*\\]",
				oe = ":(" + re + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + ie + ")*)|.*)\\)|)",
				se = new RegExp(ne + "+", "g"),
				ae = new RegExp("^" + ne + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ne + "+$", "g"),
				ue = new RegExp("^" + ne + "*," + ne + "*"),
				le = new RegExp("^" + ne + "*([>+~]|" + ne + ")" + ne + "*"),
				ce = new RegExp("=" + ne + "*([^\\]'\"]*?)" + ne + "*\\]", "g"),
				pe = new RegExp(oe),
				fe = new RegExp("^" + re + "$"),
				he = {
					ID: new RegExp("^#(" + re + ")"),
					CLASS: new RegExp("^\\.(" + re + ")"),
					TAG: new RegExp("^(" + re + "|[*])"),
					ATTR: new RegExp("^" + ie),
					PSEUDO: new RegExp("^" + oe),
					CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + ne + "*(even|odd|(([+-]|)(\\d*)n|)" + ne + "*(?:([+-]|)" + ne + "*(\\d+)|))" + ne + "*\\)|)", "i"),
					bool: new RegExp("^(?:" + te + ")$", "i"),
					needsContext: new RegExp("^" + ne + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + ne + "*((?:-\\d)?\\d*)" + ne + "*\\)|)(?=[^-]|$)", "i")
				},
				de = /^(?:input|select|textarea|button)$/i,
				ge = /^h\d$/i,
				ve = /^[^{]+\{\s*\[native \w/,
				ye = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
				me = /[+~]/,
				be = new RegExp("\\\\([\\da-f]{1,6}" + ne + "?|(" + ne + ")|.)", "ig"),
				xe = function(e, t, n) {
					var r = "0x" + t - 65536;
					return r !== r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320)
				},
				we = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
				_e = function(e, t) {
					return t ? "\0" === e ? "�" : e.slice(0, -1) + "\\" + e.charCodeAt(e.length - 1).toString(16) + " " : "\\" + e
				},
				ke = function() {
					R()
				},
				Te = d(function(e) {
					return e.disabled === !0 && ("form" in e || "label" in e)
				}, {
					dir: "parentNode",
					next: "legend"
				});
			try {
				K.apply(Z = Q.call(F.childNodes), F.childNodes), Z[F.childNodes.length].nodeType
			} catch (e) {
				K = {
					apply: Z.length ? function(e, t) {
						X.apply(e, Q.call(t))
					} : function(e, t) {
						for (var n = e.length, r = 0; e[n++] = t[r++];);
						e.length = n - 1
					}
				}
			}
			_ = t.support = {}, E = t.isXML = function(e) {
				var t = e && (e.ownerDocument || e).documentElement;
				return !!t && "HTML" !== t.nodeName
			}, R = t.setDocument = function(e) {
				var t, n, r = e ? e.ownerDocument || e : F;
				return r !== N && 9 === r.nodeType && r.documentElement ? (N = r, $ = N.documentElement, D = !E(N), F !== N && (n = N.defaultView) && n.top !== n && (n.addEventListener ? n.addEventListener("unload", ke, !1) : n.attachEvent && n.attachEvent("onunload", ke)), _.attributes = i(function(e) {
					return e.className = "i", !e.getAttribute("className")
				}), _.getElementsByTagName = i(function(e) {
					return e.appendChild(N.createComment("")), !e.getElementsByTagName("*").length
				}), _.getElementsByClassName = ve.test(N.getElementsByClassName), _.getById = i(function(e) {
					return $.appendChild(e).id = q, !N.getElementsByName || !N.getElementsByName(q).length
				}), _.getById ? (k.filter.ID = function(e) {
					var t = e.replace(be, xe);
					return function(e) {
						return e.getAttribute("id") === t
					}
				}, k.find.ID = function(e, t) {
					if ("undefined" != typeof t.getElementById && D) {
						var n = t.getElementById(e);
						return n ? [n] : []
					}
				}) : (k.filter.ID = function(e) {
					var t = e.replace(be, xe);
					return function(e) {
						var n = "undefined" != typeof e.getAttributeNode && e.getAttributeNode("id");
						return n && n.value === t
					}
				}, k.find.ID = function(e, t) {
					if ("undefined" != typeof t.getElementById && D) {
						var n, r, i, o = t.getElementById(e);
						if (o) {
							if (n = o.getAttributeNode("id"), n && n.value === e) return [o];
							for (i = t.getElementsByName(e), r = 0; o = i[r++];)
								if (n = o.getAttributeNode("id"), n && n.value === e) return [o]
						}
						return []
					}
				}), k.find.TAG = _.getElementsByTagName ? function(e, t) {
					return "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName(e) : _.qsa ? t.querySelectorAll(e) : void 0
				} : function(e, t) {
					var n, r = [],
						i = 0,
						o = t.getElementsByTagName(e);
					if ("*" === e) {
						for (; n = o[i++];) 1 === n.nodeType && r.push(n);
						return r
					}
					return o
				}, k.find.CLASS = _.getElementsByClassName && function(e, t) {
					if ("undefined" != typeof t.getElementsByClassName && D) return t.getElementsByClassName(e)
				}, L = [], M = [], (_.qsa = ve.test(N.querySelectorAll)) && (i(function(e) {
					$.appendChild(e).innerHTML = "<a id='" + q + "'></a><select id='" + q + "-\r\\' msallowcapture=''><option selected=''></option></select>", e.querySelectorAll("[msallowcapture^='']").length && M.push("[*^$]=" + ne + "*(?:''|\"\")"), e.querySelectorAll("[selected]").length || M.push("\\[" + ne + "*(?:value|" + te + ")"), e.querySelectorAll("[id~=" + q + "-]").length || M.push("~="), e.querySelectorAll(":checked").length || M.push(":checked"), e.querySelectorAll("a#" + q + "+*").length || M.push(".#.+[+~]")
				}), i(function(e) {
					e.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
					var t = N.createElement("input");
					t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && M.push("name" + ne + "*[*^$|!~]?="), 2 !== e.querySelectorAll(":enabled").length && M.push(":enabled", ":disabled"), $.appendChild(e).disabled = !0, 2 !== e.querySelectorAll(":disabled").length && M.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), M.push(",.*:")
				})), (_.matchesSelector = ve.test(P = $.matches || $.webkitMatchesSelector || $.mozMatchesSelector || $.oMatchesSelector || $.msMatchesSelector)) && i(function(e) {
					_.disconnectedMatch = P.call(e, "*"), P.call(e, "[s!='']:x"), L.push("!=", oe)
				}), M = M.length && new RegExp(M.join("|")), L = L.length && new RegExp(L.join("|")), t = ve.test($.compareDocumentPosition), B = t || ve.test($.contains) ? function(e, t) {
					var n = 9 === e.nodeType ? e.documentElement : e,
						r = t && t.parentNode;
					return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
				} : function(e, t) {
					if (t)
						for (; t = t.parentNode;)
							if (t === e) return !0;
					return !1
				}, G = t ? function(e, t) {
					if (e === t) return I = !0, 0;
					var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
					return n ? n : (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & n || !_.sortDetached && t.compareDocumentPosition(e) === n ? e === N || e.ownerDocument === F && B(F, e) ? -1 : t === N || t.ownerDocument === F && B(F, t) ? 1 : O ? ee(O, e) - ee(O, t) : 0 : 4 & n ? -1 : 1)
				} : function(e, t) {
					if (e === t) return I = !0, 0;
					var n, r = 0,
						i = e.parentNode,
						o = t.parentNode,
						a = [e],
						u = [t];
					if (!i || !o) return e === N ? -1 : t === N ? 1 : i ? -1 : o ? 1 : O ? ee(O, e) - ee(O, t) : 0;
					if (i === o) return s(e, t);
					for (n = e; n = n.parentNode;) a.unshift(n);
					for (n = t; n = n.parentNode;) u.unshift(n);
					for (; a[r] === u[r];) r++;
					return r ? s(a[r], u[r]) : a[r] === F ? -1 : u[r] === F ? 1 : 0
				}, N) : N
			}, t.matches = function(e, n) {
				return t(e, null, null, n)
			}, t.matchesSelector = function(e, n) {
				if ((e.ownerDocument || e) !== N && R(e), n = n.replace(ce, "='$1']"), _.matchesSelector && D && !W[n + " "] && (!L || !L.test(n)) && (!M || !M.test(n))) try {
					var r = P.call(e, n);
					if (r || _.disconnectedMatch || e.document && 11 !== e.document.nodeType) return r
				} catch (e) {}
				return t(n, N, null, [e]).length > 0
			}, t.contains = function(e, t) {
				return (e.ownerDocument || e) !== N && R(e), B(e, t)
			}, t.attr = function(e, t) {
				(e.ownerDocument || e) !== N && R(e);
				var n = k.attrHandle[t.toLowerCase()],
					r = n && J.call(k.attrHandle, t.toLowerCase()) ? n(e, t, !D) : void 0;
				return void 0 !== r ? r : _.attributes || !D ? e.getAttribute(t) : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
			}, t.escape = function(e) {
				return (e + "").replace(we, _e)
			}, t.error = function(e) {
				throw new Error("Syntax error, unrecognized expression: " + e)
			}, t.uniqueSort = function(e) {
				var t, n = [],
					r = 0,
					i = 0;
				if (I = !_.detectDuplicates, O = !_.sortStable && e.slice(0), e.sort(G), I) {
					for (; t = e[i++];) t === e[i] && (r = n.push(i));
					for (; r--;) e.splice(n[r], 1)
				}
				return O = null, e
			}, T = t.getText = function(e) {
				var t, n = "",
					r = 0,
					i = e.nodeType;
				if (i) {
					if (1 === i || 9 === i || 11 === i) {
						if ("string" == typeof e.textContent) return e.textContent;
						for (e = e.firstChild; e; e = e.nextSibling) n += T(e)
					} else if (3 === i || 4 === i) return e.nodeValue
				} else
					for (; t = e[r++];) n += T(t);
				return n
			}, k = t.selectors = {
				cacheLength: 50,
				createPseudo: r,
				match: he,
				attrHandle: {},
				find: {},
				relative: {
					">": {
						dir: "parentNode",
						first: !0
					},
					" ": {
						dir: "parentNode"
					},
					"+": {
						dir: "previousSibling",
						first: !0
					},
					"~": {
						dir: "previousSibling"
					}
				},
				preFilter: {
					ATTR: function(e) {
						return e[1] = e[1].replace(be, xe), e[3] = (e[3] || e[4] || e[5] || "").replace(be, xe), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
					},
					CHILD: function(e) {
						return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || t.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && t.error(e[0]), e
					},
					PSEUDO: function(e) {
						var t, n = !e[6] && e[2];
						return he.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : n && pe.test(n) && (t = C(n, !0)) && (t = n.indexOf(")", n.length - t) - n.length) && (e[0] = e[0].slice(0, t), e[2] = n.slice(0, t)), e.slice(0, 3))
					}
				},
				filter: {
					TAG: function(e) {
						var t = e.replace(be, xe).toLowerCase();
						return "*" === e ? function() {
							return !0
						} : function(e) {
							return e.nodeName && e.nodeName.toLowerCase() === t
						}
					},
					CLASS: function(e) {
						var t = z[e + " "];
						return t || (t = new RegExp("(^|" + ne + ")" + e + "(" + ne + "|$)")) && z(e, function(e) {
							return t.test("string" == typeof e.className && e.className || "undefined" != typeof e.getAttribute && e.getAttribute("class") || "")
						})
					},
					ATTR: function(e, n, r) {
						return function(i) {
							var o = t.attr(i, e);
							return null == o ? "!=" === n : !n || (o += "", "=" === n ? o === r : "!=" === n ? o !== r : "^=" === n ? r && 0 === o.indexOf(r) : "*=" === n ? r && o.indexOf(r) > -1 : "$=" === n ? r && o.slice(-r.length) === r : "~=" === n ? (" " + o.replace(se, " ") + " ").indexOf(r) > -1 : "|=" === n && (o === r || o.slice(0, r.length + 1) === r + "-"))
						}
					},
					CHILD: function(e, t, n, r, i) {
						var o = "nth" !== e.slice(0, 3),
							s = "last" !== e.slice(-4),
							a = "of-type" === t;
						return 1 === r && 0 === i ? function(e) {
							return !!e.parentNode
						} : function(t, n, u) {
							var l, c, p, f, h, d, g = o !== s ? "nextSibling" : "previousSibling",
								v = t.parentNode,
								y = a && t.nodeName.toLowerCase(),
								m = !u && !a,
								b = !1;
							if (v) {
								if (o) {
									for (; g;) {
										for (f = t; f = f[g];)
											if (a ? f.nodeName.toLowerCase() === y : 1 === f.nodeType) return !1;
										d = g = "only" === e && !d && "nextSibling"
									}
									return !0
								}
								if (d = [s ? v.firstChild : v.lastChild], s && m) {
									for (f = v, p = f[q] || (f[q] = {}), c = p[f.uniqueID] || (p[f.uniqueID] = {}), l = c[e] || [], h = l[0] === V && l[1], b = h && l[2], f = h && v.childNodes[h]; f = ++h && f && f[g] || (b = h = 0) || d.pop();)
										if (1 === f.nodeType && ++b && f === t) {
											c[e] = [V, h, b];
											break
										}
								} else if (m && (f = t, p = f[q] || (f[q] = {}), c = p[f.uniqueID] || (p[f.uniqueID] = {}), l = c[e] || [], h = l[0] === V && l[1], b = h), b === !1)
									for (;
										(f = ++h && f && f[g] || (b = h = 0) || d.pop()) && ((a ? f.nodeName.toLowerCase() !== y : 1 !== f.nodeType) || !++b || (m && (p = f[q] || (f[q] = {}), c = p[f.uniqueID] || (p[f.uniqueID] = {}), c[e] = [V, b]), f !== t)););
								return b -= i, b === r || b % r === 0 && b / r >= 0
							}
						}
					},
					PSEUDO: function(e, n) {
						var i, o = k.pseudos[e] || k.setFilters[e.toLowerCase()] || t.error("unsupported pseudo: " + e);
						return o[q] ? o(n) : o.length > 1 ? (i = [e, e, "", n], k.setFilters.hasOwnProperty(e.toLowerCase()) ? r(function(e, t) {
							for (var r, i = o(e, n), s = i.length; s--;) r = ee(e, i[s]), e[r] = !(t[r] = i[s])
						}) : function(e) {
							return o(e, 0, i)
						}) : o
					}
				},
				pseudos: {
					not: r(function(e) {
						var t = [],
							n = [],
							i = A(e.replace(ae, "$1"));
						return i[q] ? r(function(e, t, n, r) {
							for (var o, s = i(e, null, r, []), a = e.length; a--;)(o = s[a]) && (e[a] = !(t[a] = o))
						}) : function(e, r, o) {
							return t[0] = e, i(t, null, o, n), t[0] = null, !n.pop()
						}
					}),
					has: r(function(e) {
						return function(n) {
							return t(e, n).length > 0
						}
					}),
					contains: r(function(e) {
						return e = e.replace(be, xe),
							function(t) {
								return (t.textContent || t.innerText || T(t)).indexOf(e) > -1
							}
					}),
					lang: r(function(e) {
						return fe.test(e || "") || t.error("unsupported lang: " + e), e = e.replace(be, xe).toLowerCase(),
							function(t) {
								var n;
								do
									if (n = D ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang")) return n = n.toLowerCase(), n === e || 0 === n.indexOf(e + "-"); while ((t = t.parentNode) && 1 === t.nodeType);
								return !1
							}
					}),
					target: function(t) {
						var n = e.location && e.location.hash;
						return n && n.slice(1) === t.id
					},
					root: function(e) {
						return e === $
					},
					focus: function(e) {
						return e === N.activeElement && (!N.hasFocus || N.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
					},
					enabled: l(!1),
					disabled: l(!0),
					checked: function(e) {
						var t = e.nodeName.toLowerCase();
						return "input" === t && !!e.checked || "option" === t && !!e.selected
					},
					selected: function(e) {
						return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
					},
					empty: function(e) {
						for (e = e.firstChild; e; e = e.nextSibling)
							if (e.nodeType < 6) return !1;
						return !0
					},
					parent: function(e) {
						return !k.pseudos.empty(e)
					},
					header: function(e) {
						return ge.test(e.nodeName)
					},
					input: function(e) {
						return de.test(e.nodeName)
					},
					button: function(e) {
						var t = e.nodeName.toLowerCase();
						return "input" === t && "button" === e.type || "button" === t
					},
					text: function(e) {
						var t;
						return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
					},
					first: c(function() {
						return [0]
					}),
					last: c(function(e, t) {
						return [t - 1]
					}),
					eq: c(function(e, t, n) {
						return [n < 0 ? n + t : n]
					}),
					even: c(function(e, t) {
						for (var n = 0; n < t; n += 2) e.push(n);
						return e
					}),
					odd: c(function(e, t) {
						for (var n = 1; n < t; n += 2) e.push(n);
						return e
					}),
					lt: c(function(e, t, n) {
						for (var r = n < 0 ? n + t : n; --r >= 0;) e.push(r);
						return e
					}),
					gt: c(function(e, t, n) {
						for (var r = n < 0 ? n + t : n; ++r < t;) e.push(r);
						return e
					})
				}
			}, k.pseudos.nth = k.pseudos.eq;
			for (w in {
					radio: !0,
					checkbox: !0,
					file: !0,
					password: !0,
					image: !0
				}) k.pseudos[w] = a(w);
			for (w in {
					submit: !0,
					reset: !0
				}) k.pseudos[w] = u(w);
			return f.prototype = k.filters = k.pseudos, k.setFilters = new f, C = t.tokenize = function(e, n) {
				var r, i, o, s, a, u, l, c = H[e + " "];
				if (c) return n ? 0 : c.slice(0);
				for (a = e, u = [], l = k.preFilter; a;) {
					r && !(i = ue.exec(a)) || (i && (a = a.slice(i[0].length) || a), u.push(o = [])), r = !1, (i = le.exec(a)) && (r = i.shift(), o.push({
						value: r,
						type: i[0].replace(ae, " ")
					}), a = a.slice(r.length));
					for (s in k.filter) !(i = he[s].exec(a)) || l[s] && !(i = l[s](i)) || (r = i.shift(), o.push({
						value: r,
						type: s,
						matches: i
					}), a = a.slice(r.length));
					if (!r) break
				}
				return n ? a.length : a ? t.error(e) : H(e, u).slice(0)
			}, A = t.compile = function(e, t) {
				var n, r = [],
					i = [],
					o = W[e + " "];
				if (!o) {
					for (t || (t = C(e)), n = t.length; n--;) o = b(t[n]), o[q] ? r.push(o) : i.push(o);
					o = W(e, x(i, r)), o.selector = e
				}
				return o
			}, S = t.select = function(e, t, n, r) {
				var i, o, s, a, u, l = "function" == typeof e && e,
					c = !r && C(e = l.selector || e);
				if (n = n || [], 1 === c.length) {
					if (o = c[0] = c[0].slice(0), o.length > 2 && "ID" === (s = o[0]).type && 9 === t.nodeType && D && k.relative[o[1].type]) {
						if (t = (k.find.ID(s.matches[0].replace(be, xe), t) || [])[0], !t) return n;
						l && (t = t.parentNode), e = e.slice(o.shift().value.length)
					}
					for (i = he.needsContext.test(e) ? 0 : o.length; i-- && (s = o[i], !k.relative[a = s.type]);)
						if ((u = k.find[a]) && (r = u(s.matches[0].replace(be, xe), me.test(o[0].type) && p(t.parentNode) || t))) {
							if (o.splice(i, 1), e = r.length && h(o), !e) return K.apply(n, r), n;
							break
						}
				}
				return (l || A(e, c))(r, t, !D, n, !t || me.test(e) && p(t.parentNode) || t), n
			}, _.sortStable = q.split("").sort(G).join("") === q, _.detectDuplicates = !!I, R(), _.sortDetached = i(function(e) {
				return 1 & e.compareDocumentPosition(N.createElement("fieldset"))
			}), i(function(e) {
				return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href")
			}) || o("type|href|height|width", function(e, t, n) {
				if (!n) return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
			}), _.attributes && i(function(e) {
				return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
			}) || o("value", function(e, t, n) {
				if (!n && "input" === e.nodeName.toLowerCase()) return e.defaultValue
			}), i(function(e) {
				return null == e.getAttribute("disabled")
			}) || o(te, function(e, t, n) {
				var r;
				if (!n) return e[t] === !0 ? t.toLowerCase() : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
			}), t
		}(e);
		de.find = be, de.expr = be.selectors, de.expr[":"] = de.expr.pseudos, de.uniqueSort = de.unique = be.uniqueSort, de.text = be.getText, de.isXMLDoc = be.isXML, de.contains = be.contains, de.escapeSelector = be.escape;
		var xe = function(e, t, n) {
				for (var r = [], i = void 0 !== n;
					(e = e[t]) && 9 !== e.nodeType;)
					if (1 === e.nodeType) {
						if (i && de(e).is(n)) break;
						r.push(e)
					}
				return r
			},
			we = function(e, t) {
				for (var n = []; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
				return n
			},
			_e = de.expr.match.needsContext,
			ke = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,
			Te = /^.[^:#\[\.,]*$/;
		de.filter = function(e, t, n) {
			var r = t[0];
			return n && (e = ":not(" + e + ")"), 1 === t.length && 1 === r.nodeType ? de.find.matchesSelector(r, e) ? [r] : [] : de.find.matches(e, de.grep(t, function(e) {
				return 1 === e.nodeType
			}))
		}, de.fn.extend({
			find: function(e) {
				var t, n, r = this.length,
					i = this;
				if ("string" != typeof e) return this.pushStack(de(e).filter(function() {
					for (t = 0; t < r; t++)
						if (de.contains(i[t], this)) return !0
				}));
				for (n = this.pushStack([]), t = 0; t < r; t++) de.find(e, i[t], n);
				return r > 1 ? de.uniqueSort(n) : n
			},
			filter: function(e) {
				return this.pushStack(i(this, e || [], !1))
			},
			not: function(e) {
				return this.pushStack(i(this, e || [], !0))
			},
			is: function(e) {
				return !!i(this, "string" == typeof e && _e.test(e) ? de(e) : e || [], !1).length
			}
		});
		var Ee, Ce = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
			Ae = de.fn.init = function(e, t, n) {
				var r, i;
				if (!e) return this;
				if (n = n || Ee, "string" == typeof e) {
					if (r = "<" === e[0] && ">" === e[e.length - 1] && e.length >= 3 ? [null, e, null] : Ce.exec(e), !r || !r[1] && t) return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
					if (r[1]) {
						if (t = t instanceof de ? t[0] : t, de.merge(this, de.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : te, !0)), ke.test(r[1]) && de.isPlainObject(t))
							for (r in t) de.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
						return this
					}
					return i = te.getElementById(r[2]), i && (this[0] = i, this.length = 1), this
				}
				return e.nodeType ? (this[0] = e, this.length = 1, this) : de.isFunction(e) ? void 0 !== n.ready ? n.ready(e) : e(de) : de.makeArray(e, this)
			};
		Ae.prototype = de.fn, Ee = de(te);
		var Se = /^(?:parents|prev(?:Until|All))/,
			je = {
				children: !0,
				contents: !0,
				next: !0,
				prev: !0
			};
		de.fn.extend({
			has: function(e) {
				var t = de(e, this),
					n = t.length;
				return this.filter(function() {
					for (var e = 0; e < n; e++)
						if (de.contains(this, t[e])) return !0
				})
			},
			closest: function(e, t) {
				var n, r = 0,
					i = this.length,
					o = [],
					s = "string" != typeof e && de(e);
				if (!_e.test(e))
					for (; r < i; r++)
						for (n = this[r]; n && n !== t; n = n.parentNode)
							if (n.nodeType < 11 && (s ? s.index(n) > -1 : 1 === n.nodeType && de.find.matchesSelector(n, e))) {
								o.push(n);
								break
							}
				return this.pushStack(o.length > 1 ? de.uniqueSort(o) : o)
			},
			index: function(e) {
				return e ? "string" == typeof e ? se.call(de(e), this[0]) : se.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
			},
			add: function(e, t) {
				return this.pushStack(de.uniqueSort(de.merge(this.get(), de(e, t))))
			},
			addBack: function(e) {
				return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
			}
		}), de.each({
			parent: function(e) {
				var t = e.parentNode;
				return t && 11 !== t.nodeType ? t : null
			},
			parents: function(e) {
				return xe(e, "parentNode")
			},
			parentsUntil: function(e, t, n) {
				return xe(e, "parentNode", n)
			},
			next: function(e) {
				return o(e, "nextSibling")
			},
			prev: function(e) {
				return o(e, "previousSibling")
			},
			nextAll: function(e) {
				return xe(e, "nextSibling")
			},
			prevAll: function(e) {
				return xe(e, "previousSibling")
			},
			nextUntil: function(e, t, n) {
				return xe(e, "nextSibling", n)
			},
			prevUntil: function(e, t, n) {
				return xe(e, "previousSibling", n)
			},
			siblings: function(e) {
				return we((e.parentNode || {}).firstChild, e)
			},
			children: function(e) {
				return we(e.firstChild)
			},
			contents: function(e) {
				return e.contentDocument || de.merge([], e.childNodes)
			}
		}, function(e, t) {
			de.fn[e] = function(n, r) {
				var i = de.map(this, t, n);
				return "Until" !== e.slice(-5) && (r = n), r && "string" == typeof r && (i = de.filter(r, i)), this.length > 1 && (je[e] || de.uniqueSort(i), Se.test(e) && i.reverse()), this.pushStack(i)
			}
		});
		var Oe = /[^\x20\t\r\n\f]+/g;
		de.Callbacks = function(e) {
			e = "string" == typeof e ? s(e) : de.extend({}, e);
			var t, n, r, i, o = [],
				a = [],
				u = -1,
				l = function() {
					for (i = e.once, r = t = !0; a.length; u = -1)
						for (n = a.shift(); ++u < o.length;) o[u].apply(n[0], n[1]) === !1 && e.stopOnFalse && (u = o.length, n = !1);
					e.memory || (n = !1), t = !1, i && (o = n ? [] : "")
				},
				c = {
					add: function() {
						return o && (n && !t && (u = o.length - 1, a.push(n)), function t(n) {
							de.each(n, function(n, r) {
								de.isFunction(r) ? e.unique && c.has(r) || o.push(r) : r && r.length && "string" !== de.type(r) && t(r)
							})
						}(arguments), n && !t && l()), this
					},
					remove: function() {
						return de.each(arguments, function(e, t) {
							for (var n;
								(n = de.inArray(t, o, n)) > -1;) o.splice(n, 1), n <= u && u--
						}), this
					},
					has: function(e) {
						return e ? de.inArray(e, o) > -1 : o.length > 0
					},
					empty: function() {
						return o && (o = []), this
					},
					disable: function() {
						return i = a = [], o = n = "", this
					},
					disabled: function() {
						return !o
					},
					lock: function() {
						return i = a = [], n || t || (o = n = ""), this
					},
					locked: function() {
						return !!i
					},
					fireWith: function(e, n) {
						return i || (n = n || [], n = [e, n.slice ? n.slice() : n], a.push(n), t || l()), this
					},
					fire: function() {
						return c.fireWith(this, arguments), this
					},
					fired: function() {
						return !!r
					}
				};
			return c
		}, de.extend({
			Deferred: function(t) {
				var n = [
						["notify", "progress", de.Callbacks("memory"), de.Callbacks("memory"), 2],
						["resolve", "done", de.Callbacks("once memory"), de.Callbacks("once memory"), 0, "resolved"],
						["reject", "fail", de.Callbacks("once memory"), de.Callbacks("once memory"), 1, "rejected"]
					],
					r = "pending",
					i = {
						state: function() {
							return r
						},
						always: function() {
							return o.done(arguments).fail(arguments), this
						},
						catch: function(e) {
							return i.then(null, e)
						},
						pipe: function() {
							var e = arguments;
							return de.Deferred(function(t) {
								de.each(n, function(n, r) {
									var i = de.isFunction(e[r[4]]) && e[r[4]];
									o[r[1]](function() {
										var e = i && i.apply(this, arguments);
										e && de.isFunction(e.promise) ? e.promise().progress(t.notify).done(t.resolve).fail(t.reject) : t[r[0] + "With"](this, i ? [e] : arguments)
									})
								}), e = null
							}).promise()
						},
						then: function(t, r, i) {
							function o(t, n, r, i) {
								return function() {
									var l = this,
										c = arguments,
										p = function() {
											var e, p;
											if (!(t < s)) {
												if (e = r.apply(l, c), e === n.promise()) throw new TypeError("Thenable self-resolution");
												p = e && ("object" == typeof e || "function" == typeof e) && e.then, de.isFunction(p) ? i ? p.call(e, o(s, n, a, i), o(s, n, u, i)) : (s++, p.call(e, o(s, n, a, i), o(s, n, u, i), o(s, n, a, n.notifyWith))) : (r !== a && (l = void 0, c = [e]), (i || n.resolveWith)(l, c))
											}
										},
										f = i ? p : function() {
											try {
												p()
											} catch (e) {
												de.Deferred.exceptionHook && de.Deferred.exceptionHook(e, f.stackTrace), t + 1 >= s && (r !== u && (l = void 0, c = [e]), n.rejectWith(l, c))
											}
										};
									t ? f() : (de.Deferred.getStackHook && (f.stackTrace = de.Deferred.getStackHook()), e.setTimeout(f))
								}
							}
							var s = 0;
							return de.Deferred(function(e) {
								n[0][3].add(o(0, e, de.isFunction(i) ? i : a, e.notifyWith)), n[1][3].add(o(0, e, de.isFunction(t) ? t : a)), n[2][3].add(o(0, e, de.isFunction(r) ? r : u))
							}).promise()
						},
						promise: function(e) {
							return null != e ? de.extend(e, i) : i
						}
					},
					o = {};
				return de.each(n, function(e, t) {
					var s = t[2],
						a = t[5];
					i[t[1]] = s.add, a && s.add(function() {
						r = a
					}, n[3 - e][2].disable, n[0][2].lock), s.add(t[3].fire), o[t[0]] = function() {
						return o[t[0] + "With"](this === o ? void 0 : this, arguments), this
					}, o[t[0] + "With"] = s.fireWith
				}), i.promise(o), t && t.call(o, o), o
			},
			when: function(e) {
				var t = arguments.length,
					n = t,
					r = Array(n),
					i = re.call(arguments),
					o = de.Deferred(),
					s = function(e) {
						return function(n) {
							r[e] = this, i[e] = arguments.length > 1 ? re.call(arguments) : n, --t || o.resolveWith(r, i)
						}
					};
				if (t <= 1 && (l(e, o.done(s(n)).resolve, o.reject), "pending" === o.state() || de.isFunction(i[n] && i[n].then))) return o.then();
				for (; n--;) l(i[n], s(n), o.reject);
				return o.promise()
			}
		});
		var Ie = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
		de.Deferred.exceptionHook = function(t, n) {
			e.console && e.console.warn && t && Ie.test(t.name) && e.console.warn("jQuery.Deferred exception: " + t.message, t.stack, n)
		}, de.readyException = function(t) {
			e.setTimeout(function() {
				throw t
			})
		};
		var Re = de.Deferred();
		de.fn.ready = function(e) {
			return Re.then(e).catch(function(e) {
				de.readyException(e)
			}), this
		}, de.extend({
			isReady: !1,
			readyWait: 1,
			holdReady: function(e) {
				e ? de.readyWait++ : de.ready(!0)
			},
			ready: function(e) {
				(e === !0 ? --de.readyWait : de.isReady) || (de.isReady = !0, e !== !0 && --de.readyWait > 0 || Re.resolveWith(te, [de]))
			}
		}), de.ready.then = Re.then, "complete" === te.readyState || "loading" !== te.readyState && !te.documentElement.doScroll ? e.setTimeout(de.ready) : (te.addEventListener("DOMContentLoaded", c), e.addEventListener("load", c));
		var Ne = function(e, t, n, r, i, o, s) {
				var a = 0,
					u = e.length,
					l = null == n;
				if ("object" === de.type(n)) {
					i = !0;
					for (a in n) Ne(e, t, a, n[a], !0, o, s)
				} else if (void 0 !== r && (i = !0, de.isFunction(r) || (s = !0), l && (s ? (t.call(e, r), t = null) : (l = t, t = function(e, t, n) {
						return l.call(de(e), n)
					})), t))
					for (; a < u; a++) t(e[a], n, s ? r : r.call(e[a], a, t(e[a], n)));
				return i ? e : l ? t.call(e) : u ? t(e[0], n) : o
			},
			$e = function(e) {
				return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType
			};
		p.uid = 1, p.prototype = {
			cache: function(e) {
				var t = e[this.expando];
				return t || (t = {}, $e(e) && (e.nodeType ? e[this.expando] = t : Object.defineProperty(e, this.expando, {
					value: t,
					configurable: !0
				}))), t
			},
			set: function(e, t, n) {
				var r, i = this.cache(e);
				if ("string" == typeof t) i[de.camelCase(t)] = n;
				else
					for (r in t) i[de.camelCase(r)] = t[r];
				return i
			},
			get: function(e, t) {
				return void 0 === t ? this.cache(e) : e[this.expando] && e[this.expando][de.camelCase(t)]
			},
			access: function(e, t, n) {
				return void 0 === t || t && "string" == typeof t && void 0 === n ? this.get(e, t) : (this.set(e, t, n), void 0 !== n ? n : t)
			},
			remove: function(e, t) {
				var n, r = e[this.expando];
				if (void 0 !== r) {
					if (void 0 !== t) {
						de.isArray(t) ? t = t.map(de.camelCase) : (t = de.camelCase(t), t = t in r ? [t] : t.match(Oe) || []), n = t.length;
						for (; n--;) delete r[t[n]]
					}(void 0 === t || de.isEmptyObject(r)) && (e.nodeType ? e[this.expando] = void 0 : delete e[this.expando])
				}
			},
			hasData: function(e) {
				var t = e[this.expando];
				return void 0 !== t && !de.isEmptyObject(t)
			}
		};
		var De = new p,
			Me = new p,
			Le = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
			Pe = /[A-Z]/g;
		de.extend({
			hasData: function(e) {
				return Me.hasData(e) || De.hasData(e)
			},
			data: function(e, t, n) {
				return Me.access(e, t, n)
			},
			removeData: function(e, t) {
				Me.remove(e, t)
			},
			_data: function(e, t, n) {
				return De.access(e, t, n)
			},
			_removeData: function(e, t) {
				De.remove(e, t)
			}
		}), de.fn.extend({
			data: function(e, t) {
				var n, r, i, o = this[0],
					s = o && o.attributes;
				if (void 0 === e) {
					if (this.length && (i = Me.get(o), 1 === o.nodeType && !De.get(o, "hasDataAttrs"))) {
						for (n = s.length; n--;) s[n] && (r = s[n].name, 0 === r.indexOf("data-") && (r = de.camelCase(r.slice(5)), h(o, r, i[r])));
						De.set(o, "hasDataAttrs", !0)
					}
					return i
				}
				return "object" == typeof e ? this.each(function() {
					Me.set(this, e)
				}) : Ne(this, function(t) {
					var n;
					if (o && void 0 === t) {
						if (n = Me.get(o, e), void 0 !== n) return n;
						if (n = h(o, e), void 0 !== n) return n
					} else this.each(function() {
						Me.set(this, e, t)
					})
				}, null, t, arguments.length > 1, null, !0)
			},
			removeData: function(e) {
				return this.each(function() {
					Me.remove(this, e)
				})
			}
		}), de.extend({
			queue: function(e, t, n) {
				var r;
				if (e) return t = (t || "fx") + "queue", r = De.get(e, t), n && (!r || de.isArray(n) ? r = De.access(e, t, de.makeArray(n)) : r.push(n)), r || []
			},
			dequeue: function(e, t) {
				t = t || "fx";
				var n = de.queue(e, t),
					r = n.length,
					i = n.shift(),
					o = de._queueHooks(e, t),
					s = function() {
						de.dequeue(e, t)
					};
				"inprogress" === i && (i = n.shift(), r--), i && ("fx" === t && n.unshift("inprogress"), delete o.stop, i.call(e, s, o)), !r && o && o.empty.fire()
			},
			_queueHooks: function(e, t) {
				var n = t + "queueHooks";
				return De.get(e, n) || De.access(e, n, {
					empty: de.Callbacks("once memory").add(function() {
						De.remove(e, [t + "queue", n])
					})
				})
			}
		}), de.fn.extend({
			queue: function(e, t) {
				var n = 2;
				return "string" != typeof e && (t = e, e = "fx", n--), arguments.length < n ? de.queue(this[0], e) : void 0 === t ? this : this.each(function() {
					var n = de.queue(this, e, t);
					de._queueHooks(this, e), "fx" === e && "inprogress" !== n[0] && de.dequeue(this, e)
				})
			},
			dequeue: function(e) {
				return this.each(function() {
					de.dequeue(this, e)
				})
			},
			clearQueue: function(e) {
				return this.queue(e || "fx", [])
			},
			promise: function(e, t) {
				var n, r = 1,
					i = de.Deferred(),
					o = this,
					s = this.length,
					a = function() {
						--r || i.resolveWith(o, [o])
					};
				for ("string" != typeof e && (t = e, e = void 0), e = e || "fx"; s--;) n = De.get(o[s], e + "queueHooks"), n && n.empty && (r++, n.empty.add(a));
				return a(), i.promise(t)
			}
		});
		var Be = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
			qe = new RegExp("^(?:([+-])=|)(" + Be + ")([a-z%]*)$", "i"),
			Fe = ["Top", "Right", "Bottom", "Left"],
			Ve = function(e, t) {
				return e = t || e, "none" === e.style.display || "" === e.style.display && de.contains(e.ownerDocument, e) && "none" === de.css(e, "display")
			},
			Ue = function(e, t, n, r) {
				var i, o, s = {};
				for (o in t) s[o] = e.style[o], e.style[o] = t[o];
				i = n.apply(e, r || []);
				for (o in t) e.style[o] = s[o];
				return i
			},
			ze = {};
		de.fn.extend({
			show: function() {
				return v(this, !0)
			},
			hide: function() {
				return v(this)
			},
			toggle: function(e) {
				return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function() {
					Ve(this) ? de(this).show() : de(this).hide()
				})
			}
		});
		var He = /^(?:checkbox|radio)$/i,
			We = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i,
			Ge = /^$|\/(?:java|ecma)script/i,
			Je = {
				option: [1, "<select multiple='multiple'>", "</select>"],
				thead: [1, "<table>", "</table>"],
				col: [2, "<table><colgroup>", "</colgroup></table>"],
				tr: [2, "<table><tbody>", "</tbody></table>"],
				td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
				_default: [0, "", ""]
			};
		Je.optgroup = Je.option, Je.tbody = Je.tfoot = Je.colgroup = Je.caption = Je.thead, Je.th = Je.td;
		var Ze = /<|&#?\w+;/;
		! function() {
			var e = te.createDocumentFragment(),
				t = e.appendChild(te.createElement("div")),
				n = te.createElement("input");
			n.setAttribute("type", "radio"), n.setAttribute("checked", "checked"), n.setAttribute("name", "t"), t.appendChild(n), fe.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked, t.innerHTML = "<textarea>x</textarea>", fe.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue
		}();
		var Ye = te.documentElement,
			Xe = /^key/,
			Ke = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
			Qe = /^([^.]*)(?:\.(.+)|)/;
		de.event = {
			global: {},
			add: function(e, t, n, r, i) {
				var o, s, a, u, l, c, p, f, h, d, g, v = De.get(e);
				if (v)
					for (n.handler && (o = n, n = o.handler, i = o.selector), i && de.find.matchesSelector(Ye, i), n.guid || (n.guid = de.guid++), (u = v.events) || (u = v.events = {}), (s = v.handle) || (s = v.handle = function(t) {
							return "undefined" != typeof de && de.event.triggered !== t.type ? de.event.dispatch.apply(e, arguments) : void 0
						}), t = (t || "").match(Oe) || [""], l = t.length; l--;) a = Qe.exec(t[l]) || [], h = g = a[1], d = (a[2] || "").split(".").sort(), h && (p = de.event.special[h] || {}, h = (i ? p.delegateType : p.bindType) || h, p = de.event.special[h] || {}, c = de.extend({
						type: h,
						origType: g,
						data: r,
						handler: n,
						guid: n.guid,
						selector: i,
						needsContext: i && de.expr.match.needsContext.test(i),
						namespace: d.join(".")
					}, o), (f = u[h]) || (f = u[h] = [], f.delegateCount = 0, p.setup && p.setup.call(e, r, d, s) !== !1 || e.addEventListener && e.addEventListener(h, s)), p.add && (p.add.call(e, c), c.handler.guid || (c.handler.guid = n.guid)), i ? f.splice(f.delegateCount++, 0, c) : f.push(c), de.event.global[h] = !0)
			},
			remove: function(e, t, n, r, i) {
				var o, s, a, u, l, c, p, f, h, d, g, v = De.hasData(e) && De.get(e);
				if (v && (u = v.events)) {
					for (t = (t || "").match(Oe) || [""], l = t.length; l--;)
						if (a = Qe.exec(t[l]) || [], h = g = a[1], d = (a[2] || "").split(".").sort(), h) {
							for (p = de.event.special[h] || {}, h = (r ? p.delegateType : p.bindType) || h, f = u[h] || [], a = a[2] && new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)"), s = o = f.length; o--;) c = f[o], !i && g !== c.origType || n && n.guid !== c.guid || a && !a.test(c.namespace) || r && r !== c.selector && ("**" !== r || !c.selector) || (f.splice(o, 1), c.selector && f.delegateCount--, p.remove && p.remove.call(e, c));
							s && !f.length && (p.teardown && p.teardown.call(e, d, v.handle) !== !1 || de.removeEvent(e, h, v.handle), delete u[h])
						} else
							for (h in u) de.event.remove(e, h + t[l], n, r, !0);
					de.isEmptyObject(u) && De.remove(e, "handle events")
				}
			},
			dispatch: function(e) {
				var t, n, r, i, o, s, a = de.event.fix(e),
					u = new Array(arguments.length),
					l = (De.get(this, "events") || {})[a.type] || [],
					c = de.event.special[a.type] || {};
				for (u[0] = a, t = 1; t < arguments.length; t++) u[t] = arguments[t];
				if (a.delegateTarget = this, !c.preDispatch || c.preDispatch.call(this, a) !== !1) {
					for (s = de.event.handlers.call(this, a, l), t = 0;
						(i = s[t++]) && !a.isPropagationStopped();)
						for (a.currentTarget = i.elem, n = 0;
							(o = i.handlers[n++]) && !a.isImmediatePropagationStopped();) a.rnamespace && !a.rnamespace.test(o.namespace) || (a.handleObj = o, a.data = o.data, r = ((de.event.special[o.origType] || {}).handle || o.handler).apply(i.elem, u), void 0 !== r && (a.result = r) === !1 && (a.preventDefault(), a.stopPropagation()));
					return c.postDispatch && c.postDispatch.call(this, a), a.result
				}
			},
			handlers: function(e, t) {
				var n, r, i, o, s, a = [],
					u = t.delegateCount,
					l = e.target;
				if (u && l.nodeType && !("click" === e.type && e.button >= 1))
					for (; l !== this; l = l.parentNode || this)
						if (1 === l.nodeType && ("click" !== e.type || l.disabled !== !0)) {
							for (o = [], s = {}, n = 0; n < u; n++) r = t[n], i = r.selector + " ", void 0 === s[i] && (s[i] = r.needsContext ? de(i, this).index(l) > -1 : de.find(i, this, null, [l]).length), s[i] && o.push(r);
							o.length && a.push({
								elem: l,
								handlers: o
							})
						}
				return l = this, u < t.length && a.push({
					elem: l,
					handlers: t.slice(u)
				}), a
			},
			addProp: function(e, t) {
				Object.defineProperty(de.Event.prototype, e, {
					enumerable: !0,
					configurable: !0,
					get: de.isFunction(t) ? function() {
						if (this.originalEvent) return t(this.originalEvent)
					} : function() {
						if (this.originalEvent) return this.originalEvent[e]
					},
					set: function(t) {
						Object.defineProperty(this, e, {
							enumerable: !0,
							configurable: !0,
							writable: !0,
							value: t
						})
					}
				})
			},
			fix: function(e) {
				return e[de.expando] ? e : new de.Event(e)
			},
			special: {
				load: {
					noBubble: !0
				},
				focus: {
					trigger: function() {
						if (this !== _() && this.focus) return this.focus(), !1
					},
					delegateType: "focusin"
				},
				blur: {
					trigger: function() {
						if (this === _() && this.blur) return this.blur(), !1
					},
					delegateType: "focusout"
				},
				click: {
					trigger: function() {
						if ("checkbox" === this.type && this.click && de.nodeName(this, "input")) return this.click(), !1
					},
					_default: function(e) {
						return de.nodeName(e.target, "a")
					}
				},
				beforeunload: {
					postDispatch: function(e) {
						void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result)
					}
				}
			}
		}, de.removeEvent = function(e, t, n) {
			e.removeEventListener && e.removeEventListener(t, n)
		}, de.Event = function(e, t) {
			return this instanceof de.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && e.returnValue === !1 ? x : w, this.target = e.target && 3 === e.target.nodeType ? e.target.parentNode : e.target, this.currentTarget = e.currentTarget, this.relatedTarget = e.relatedTarget) : this.type = e, t && de.extend(this, t), this.timeStamp = e && e.timeStamp || de.now(), void(this[de.expando] = !0)) : new de.Event(e, t)
		}, de.Event.prototype = {
			constructor: de.Event,
			isDefaultPrevented: w,
			isPropagationStopped: w,
			isImmediatePropagationStopped: w,
			isSimulated: !1,
			preventDefault: function() {
				var e = this.originalEvent;
				this.isDefaultPrevented = x, e && !this.isSimulated && e.preventDefault()
			},
			stopPropagation: function() {
				var e = this.originalEvent;
				this.isPropagationStopped = x, e && !this.isSimulated && e.stopPropagation()
			},
			stopImmediatePropagation: function() {
				var e = this.originalEvent;
				this.isImmediatePropagationStopped = x, e && !this.isSimulated && e.stopImmediatePropagation(), this.stopPropagation()
			}
		}, de.each({
			altKey: !0,
			bubbles: !0,
			cancelable: !0,
			changedTouches: !0,
			ctrlKey: !0,
			detail: !0,
			eventPhase: !0,
			metaKey: !0,
			pageX: !0,
			pageY: !0,
			shiftKey: !0,
			view: !0,
			char: !0,
			charCode: !0,
			key: !0,
			keyCode: !0,
			button: !0,
			buttons: !0,
			clientX: !0,
			clientY: !0,
			offsetX: !0,
			offsetY: !0,
			pointerId: !0,
			pointerType: !0,
			screenX: !0,
			screenY: !0,
			targetTouches: !0,
			toElement: !0,
			touches: !0,
			which: function(e) {
				var t = e.button;
				return null == e.which && Xe.test(e.type) ? null != e.charCode ? e.charCode : e.keyCode : !e.which && void 0 !== t && Ke.test(e.type) ? 1 & t ? 1 : 2 & t ? 3 : 4 & t ? 2 : 0 : e.which
			}
		}, de.event.addProp), de.each({
			mouseenter: "mouseover",
			mouseleave: "mouseout",
			pointerenter: "pointerover",
			pointerleave: "pointerout"
		}, function(e, t) {
			de.event.special[e] = {
				delegateType: t,
				bindType: t,
				handle: function(e) {
					var n, r = this,
						i = e.relatedTarget,
						o = e.handleObj;
					return i && (i === r || de.contains(r, i)) || (e.type = o.origType, n = o.handler.apply(this, arguments), e.type = t), n
				}
			}
		}), de.fn.extend({
			on: function(e, t, n, r) {
				return k(this, e, t, n, r)
			},
			one: function(e, t, n, r) {
				return k(this, e, t, n, r, 1)
			},
			off: function(e, t, n) {
				var r, i;
				if (e && e.preventDefault && e.handleObj) return r = e.handleObj, de(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), this;
				if ("object" == typeof e) {
					for (i in e) this.off(i, t, e[i]);
					return this
				}
				return t !== !1 && "function" != typeof t || (n = t, t = void 0), n === !1 && (n = w), this.each(function() {
					de.event.remove(this, e, n, t)
				})
			}
		});
		var et = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
			tt = /<script|<style|<link/i,
			nt = /checked\s*(?:[^=]|=\s*.checked.)/i,
			rt = /^true\/(.*)/,
			it = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
		de.extend({
			htmlPrefilter: function(e) {
				return e.replace(et, "<$1></$2>")
			},
			clone: function(e, t, n) {
				var r, i, o, s, a = e.cloneNode(!0),
					u = de.contains(e.ownerDocument, e);
				if (!(fe.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || de.isXMLDoc(e)))
					for (s = y(a), o = y(e), r = 0, i = o.length; r < i; r++) S(o[r], s[r]);
				if (t)
					if (n)
						for (o = o || y(e), s = s || y(a), r = 0, i = o.length; r < i; r++) A(o[r], s[r]);
					else A(e, a);
				return s = y(a, "script"), s.length > 0 && m(s, !u && y(e, "script")), a
			},
			cleanData: function(e) {
				for (var t, n, r, i = de.event.special, o = 0; void 0 !== (n = e[o]); o++)
					if ($e(n)) {
						if (t = n[De.expando]) {
							if (t.events)
								for (r in t.events) i[r] ? de.event.remove(n, r) : de.removeEvent(n, r, t.handle);
							n[De.expando] = void 0
						}
						n[Me.expando] && (n[Me.expando] = void 0)
					}
			}
		}), de.fn.extend({
			detach: function(e) {
				return O(this, e, !0)
			},
			remove: function(e) {
				return O(this, e)
			},
			text: function(e) {
				return Ne(this, function(e) {
					return void 0 === e ? de.text(this) : this.empty().each(function() {
						1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = e)
					})
				}, null, e, arguments.length)
			},
			append: function() {
				return j(this, arguments, function(e) {
					if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
						var t = T(this, e);
						t.appendChild(e)
					}
				})
			},
			prepend: function() {
				return j(this, arguments, function(e) {
					if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
						var t = T(this, e);
						t.insertBefore(e, t.firstChild)
					}
				})
			},
			before: function() {
				return j(this, arguments, function(e) {
					this.parentNode && this.parentNode.insertBefore(e, this)
				})
			},
			after: function() {
				return j(this, arguments, function(e) {
					this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
				})
			},
			empty: function() {
				for (var e, t = 0; null != (e = this[t]); t++) 1 === e.nodeType && (de.cleanData(y(e, !1)), e.textContent = "");
				return this
			},
			clone: function(e, t) {
				return e = null != e && e, t = null == t ? e : t, this.map(function() {
					return de.clone(this, e, t)
				})
			},
			html: function(e) {
				return Ne(this, function(e) {
					var t = this[0] || {},
						n = 0,
						r = this.length;
					if (void 0 === e && 1 === t.nodeType) return t.innerHTML;
					if ("string" == typeof e && !tt.test(e) && !Je[(We.exec(e) || ["", ""])[1].toLowerCase()]) {
						e = de.htmlPrefilter(e);
						try {
							for (; n < r; n++) t = this[n] || {}, 1 === t.nodeType && (de.cleanData(y(t, !1)), t.innerHTML = e);
							t = 0
						} catch (e) {}
					}
					t && this.empty().append(e)
				}, null, e, arguments.length)
			},
			replaceWith: function() {
				var e = [];
				return j(this, arguments, function(t) {
					var n = this.parentNode;
					de.inArray(this, e) < 0 && (de.cleanData(y(this)), n && n.replaceChild(t, this))
				}, e)
			}
		}), de.each({
			appendTo: "append",
			prependTo: "prepend",
			insertBefore: "before",
			insertAfter: "after",
			replaceAll: "replaceWith"
		}, function(e, t) {
			de.fn[e] = function(e) {
				for (var n, r = [], i = de(e), o = i.length - 1, s = 0; s <= o; s++) n = s === o ? this : this.clone(!0), de(i[s])[t](n), oe.apply(r, n.get());
				return this.pushStack(r)
			}
		});
		var ot = /^margin/,
			st = new RegExp("^(" + Be + ")(?!px)[a-z%]+$", "i"),
			at = function(t) {
				var n = t.ownerDocument.defaultView;
				return n && n.opener || (n = e), n.getComputedStyle(t)
			};
		! function() {
			function t() {
				if (a) {
					a.style.cssText = "box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%", a.innerHTML = "", Ye.appendChild(s);
					var t = e.getComputedStyle(a);
					n = "1%" !== t.top, o = "2px" === t.marginLeft, r = "4px" === t.width, a.style.marginRight = "50%", i = "4px" === t.marginRight, Ye.removeChild(s), a = null
				}
			}
			var n, r, i, o, s = te.createElement("div"),
				a = te.createElement("div");
			a.style && (a.style.backgroundClip = "content-box", a.cloneNode(!0).style.backgroundClip = "", fe.clearCloneStyle = "content-box" === a.style.backgroundClip, s.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute", s.appendChild(a), de.extend(fe, {
				pixelPosition: function() {
					return t(), n
				},
				boxSizingReliable: function() {
					return t(), r
				},
				pixelMarginRight: function() {
					return t(), i
				},
				reliableMarginLeft: function() {
					return t(), o
				}
			}))
		}();
		var ut = /^(none|table(?!-c[ea]).+)/,
			lt = {
				position: "absolute",
				visibility: "hidden",
				display: "block"
			},
			ct = {
				letterSpacing: "0",
				fontWeight: "400"
			},
			pt = ["Webkit", "Moz", "ms"],
			ft = te.createElement("div").style;
		de.extend({
			cssHooks: {
				opacity: {
					get: function(e, t) {
						if (t) {
							var n = I(e, "opacity");
							return "" === n ? "1" : n
						}
					}
				}
			},
			cssNumber: {
				animationIterationCount: !0,
				columnCount: !0,
				fillOpacity: !0,
				flexGrow: !0,
				flexShrink: !0,
				fontWeight: !0,
				lineHeight: !0,
				opacity: !0,
				order: !0,
				orphans: !0,
				widows: !0,
				zIndex: !0,
				zoom: !0
			},
			cssProps: {
				float: "cssFloat"
			},
			style: function(e, t, n, r) {
				if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
					var i, o, s, a = de.camelCase(t),
						u = e.style;
					return t = de.cssProps[a] || (de.cssProps[a] = N(a) || a), s = de.cssHooks[t] || de.cssHooks[a], void 0 === n ? s && "get" in s && void 0 !== (i = s.get(e, !1, r)) ? i : u[t] : (o = typeof n, "string" === o && (i = qe.exec(n)) && i[1] && (n = d(e, t, i), o = "number"), void(null != n && n === n && ("number" === o && (n += i && i[3] || (de.cssNumber[a] ? "" : "px")), fe.clearCloneStyle || "" !== n || 0 !== t.indexOf("background") || (u[t] = "inherit"), s && "set" in s && void 0 === (n = s.set(e, n, r)) || (u[t] = n))))
				}
			},
			css: function(e, t, n, r) {
				var i, o, s, a = de.camelCase(t);
				return t = de.cssProps[a] || (de.cssProps[a] = N(a) || a), s = de.cssHooks[t] || de.cssHooks[a], s && "get" in s && (i = s.get(e, !0, n)), void 0 === i && (i = I(e, t, r)), "normal" === i && t in ct && (i = ct[t]), "" === n || n ? (o = parseFloat(i), n === !0 || isFinite(o) ? o || 0 : i) : i
			}
		}), de.each(["height", "width"], function(e, t) {
			de.cssHooks[t] = {
				get: function(e, n, r) {
					if (n) return !ut.test(de.css(e, "display")) || e.getClientRects().length && e.getBoundingClientRect().width ? M(e, t, r) : Ue(e, lt, function() {
						return M(e, t, r)
					})
				},
				set: function(e, n, r) {
					var i, o = r && at(e),
						s = r && D(e, t, r, "border-box" === de.css(e, "boxSizing", !1, o), o);
					return s && (i = qe.exec(n)) && "px" !== (i[3] || "px") && (e.style[t] = n, n = de.css(e, t)), $(e, n, s)
				}
			}
		}), de.cssHooks.marginLeft = R(fe.reliableMarginLeft, function(e, t) {
			if (t) return (parseFloat(I(e, "marginLeft")) || e.getBoundingClientRect().left - Ue(e, {
				marginLeft: 0
			}, function() {
				return e.getBoundingClientRect().left
			})) + "px"
		}), de.each({
			margin: "",
			padding: "",
			border: "Width"
		}, function(e, t) {
			de.cssHooks[e + t] = {
				expand: function(n) {
					for (var r = 0, i = {}, o = "string" == typeof n ? n.split(" ") : [n]; r < 4; r++) i[e + Fe[r] + t] = o[r] || o[r - 2] || o[0];
					return i
				}
			}, ot.test(e) || (de.cssHooks[e + t].set = $)
		}), de.fn.extend({
			css: function(e, t) {
				return Ne(this, function(e, t, n) {
					var r, i, o = {},
						s = 0;
					if (de.isArray(t)) {
						for (r = at(e), i = t.length; s < i; s++) o[t[s]] = de.css(e, t[s], !1, r);
						return o
					}
					return void 0 !== n ? de.style(e, t, n) : de.css(e, t)
				}, e, t, arguments.length > 1)
			}
		}), de.Tween = L, L.prototype = {
			constructor: L,
			init: function(e, t, n, r, i, o) {
				this.elem = e, this.prop = n, this.easing = i || de.easing._default, this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = o || (de.cssNumber[n] ? "" : "px")
			},
			cur: function() {
				var e = L.propHooks[this.prop];
				return e && e.get ? e.get(this) : L.propHooks._default.get(this)
			},
			run: function(e) {
				var t, n = L.propHooks[this.prop];
				return this.options.duration ? this.pos = t = de.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : L.propHooks._default.set(this), this
			}
		}, L.prototype.init.prototype = L.prototype, L.propHooks = {
			_default: {
				get: function(e) {
					var t;
					return 1 !== e.elem.nodeType || null != e.elem[e.prop] && null == e.elem.style[e.prop] ? e.elem[e.prop] : (t = de.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0)
				},
				set: function(e) {
					de.fx.step[e.prop] ? de.fx.step[e.prop](e) : 1 !== e.elem.nodeType || null == e.elem.style[de.cssProps[e.prop]] && !de.cssHooks[e.prop] ? e.elem[e.prop] = e.now : de.style(e.elem, e.prop, e.now + e.unit)
				}
			}
		}, L.propHooks.scrollTop = L.propHooks.scrollLeft = {
			set: function(e) {
				e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
			}
		}, de.easing = {
			linear: function(e) {
				return e
			},
			swing: function(e) {
				return .5 - Math.cos(e * Math.PI) / 2
			},
			_default: "swing"
		}, de.fx = L.prototype.init, de.fx.step = {};
		var ht, dt, gt = /^(?:toggle|show|hide)$/,
			vt = /queueHooks$/;
		de.Animation = de.extend(z, {
				tweeners: {
					"*": [function(e, t) {
						var n = this.createTween(e, t);
						return d(n.elem, e, qe.exec(t), n), n
					}]
				},
				tweener: function(e, t) {
					de.isFunction(e) ? (t = e, e = ["*"]) : e = e.match(Oe);
					for (var n, r = 0, i = e.length; r < i; r++) n = e[r], z.tweeners[n] = z.tweeners[n] || [], z.tweeners[n].unshift(t)
				},
				prefilters: [V],
				prefilter: function(e, t) {
					t ? z.prefilters.unshift(e) : z.prefilters.push(e)
				}
			}), de.speed = function(e, t, n) {
				var r = e && "object" == typeof e ? de.extend({}, e) : {
					complete: n || !n && t || de.isFunction(e) && e,
					duration: e,
					easing: n && t || t && !de.isFunction(t) && t
				};
				return de.fx.off || te.hidden ? r.duration = 0 : "number" != typeof r.duration && (r.duration in de.fx.speeds ? r.duration = de.fx.speeds[r.duration] : r.duration = de.fx.speeds._default), null != r.queue && r.queue !== !0 || (r.queue = "fx"), r.old = r.complete, r.complete = function() {
					de.isFunction(r.old) && r.old.call(this), r.queue && de.dequeue(this, r.queue)
				}, r
			}, de.fn.extend({
				fadeTo: function(e, t, n, r) {
					return this.filter(Ve).css("opacity", 0).show().end().animate({
						opacity: t
					}, e, n, r)
				},
				animate: function(e, t, n, r) {
					var i = de.isEmptyObject(e),
						o = de.speed(t, n, r),
						s = function() {
							var t = z(this, de.extend({}, e), o);
							(i || De.get(this, "finish")) && t.stop(!0)
						};
					return s.finish = s, i || o.queue === !1 ? this.each(s) : this.queue(o.queue, s)
				},
				stop: function(e, t, n) {
					var r = function(e) {
						var t = e.stop;
						delete e.stop, t(n)
					};
					return "string" != typeof e && (n = t, t = e, e = void 0), t && e !== !1 && this.queue(e || "fx", []), this.each(function() {
						var t = !0,
							i = null != e && e + "queueHooks",
							o = de.timers,
							s = De.get(this);
						if (i) s[i] && s[i].stop && r(s[i]);
						else
							for (i in s) s[i] && s[i].stop && vt.test(i) && r(s[i]);
						for (i = o.length; i--;) o[i].elem !== this || null != e && o[i].queue !== e || (o[i].anim.stop(n), t = !1, o.splice(i, 1));
						!t && n || de.dequeue(this, e)
					})
				},
				finish: function(e) {
					return e !== !1 && (e = e || "fx"), this.each(function() {
						var t, n = De.get(this),
							r = n[e + "queue"],
							i = n[e + "queueHooks"],
							o = de.timers,
							s = r ? r.length : 0;
						for (n.finish = !0, de.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = o.length; t--;) o[t].elem === this && o[t].queue === e && (o[t].anim.stop(!0), o.splice(t, 1));
						for (t = 0; t < s; t++) r[t] && r[t].finish && r[t].finish.call(this);
						delete n.finish
					})
				}
			}), de.each(["toggle", "show", "hide"], function(e, t) {
				var n = de.fn[t];
				de.fn[t] = function(e, r, i) {
					return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(q(t, !0), e, r, i)
				}
			}), de.each({
				slideDown: q("show"),
				slideUp: q("hide"),
				slideToggle: q("toggle"),
				fadeIn: {
					opacity: "show"
				},
				fadeOut: {
					opacity: "hide"
				},
				fadeToggle: {
					opacity: "toggle"
				}
			}, function(e, t) {
				de.fn[e] = function(e, n, r) {
					return this.animate(t, e, n, r)
				}
			}), de.timers = [], de.fx.tick = function() {
				var e, t = 0,
					n = de.timers;
				for (ht = de.now(); t < n.length; t++) e = n[t], e() || n[t] !== e || n.splice(t--, 1);
				n.length || de.fx.stop(), ht = void 0
			}, de.fx.timer = function(e) {
				de.timers.push(e), e() ? de.fx.start() : de.timers.pop()
			}, de.fx.interval = 13, de.fx.start = function() {
				dt || (dt = e.requestAnimationFrame ? e.requestAnimationFrame(P) : e.setInterval(de.fx.tick, de.fx.interval))
			}, de.fx.stop = function() {
				e.cancelAnimationFrame ? e.cancelAnimationFrame(dt) : e.clearInterval(dt), dt = null
			}, de.fx.speeds = {
				slow: 600,
				fast: 200,
				_default: 400
			}, de.fn.delay = function(t, n) {
				return t = de.fx ? de.fx.speeds[t] || t : t, n = n || "fx", this.queue(n, function(n, r) {
					var i = e.setTimeout(n, t);
					r.stop = function() {
						e.clearTimeout(i)
					}
				})
			},
			function() {
				var e = te.createElement("input"),
					t = te.createElement("select"),
					n = t.appendChild(te.createElement("option"));
				e.type = "checkbox", fe.checkOn = "" !== e.value, fe.optSelected = n.selected, e = te.createElement("input"), e.value = "t", e.type = "radio", fe.radioValue = "t" === e.value
			}();
		var yt, mt = de.expr.attrHandle;
		de.fn.extend({
			attr: function(e, t) {
				return Ne(this, de.attr, e, t, arguments.length > 1)
			},
			removeAttr: function(e) {
				return this.each(function() {
					de.removeAttr(this, e)
				})
			}
		}), de.extend({
			attr: function(e, t, n) {
				var r, i, o = e.nodeType;
				if (3 !== o && 8 !== o && 2 !== o) return "undefined" == typeof e.getAttribute ? de.prop(e, t, n) : (1 === o && de.isXMLDoc(e) || (i = de.attrHooks[t.toLowerCase()] || (de.expr.match.bool.test(t) ? yt : void 0)), void 0 !== n ? null === n ? void de.removeAttr(e, t) : i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : (e.setAttribute(t, n + ""), n) : i && "get" in i && null !== (r = i.get(e, t)) ? r : (r = de.find.attr(e, t), null == r ? void 0 : r))
			},
			attrHooks: {
				type: {
					set: function(e, t) {
						if (!fe.radioValue && "radio" === t && de.nodeName(e, "input")) {
							var n = e.value;
							return e.setAttribute("type", t), n && (e.value = n), t
						}
					}
				}
			},
			removeAttr: function(e, t) {
				var n, r = 0,
					i = t && t.match(Oe);
				if (i && 1 === e.nodeType)
					for (; n = i[r++];) e.removeAttribute(n)
			}
		}), yt = {
			set: function(e, t, n) {
				return t === !1 ? de.removeAttr(e, n) : e.setAttribute(n, n), n
			}
		}, de.each(de.expr.match.bool.source.match(/\w+/g), function(e, t) {
			var n = mt[t] || de.find.attr;
			mt[t] = function(e, t, r) {
				var i, o, s = t.toLowerCase();
				return r || (o = mt[s], mt[s] = i, i = null != n(e, t, r) ? s : null, mt[s] = o), i
			}
		});
		var bt = /^(?:input|select|textarea|button)$/i,
			xt = /^(?:a|area)$/i;
		de.fn.extend({
			prop: function(e, t) {
				return Ne(this, de.prop, e, t, arguments.length > 1)
			},
			removeProp: function(e) {
				return this.each(function() {
					delete this[de.propFix[e] || e]
				})
			}
		}), de.extend({
			prop: function(e, t, n) {
				var r, i, o = e.nodeType;
				if (3 !== o && 8 !== o && 2 !== o) return 1 === o && de.isXMLDoc(e) || (t = de.propFix[t] || t, i = de.propHooks[t]), void 0 !== n ? i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : e[t] = n : i && "get" in i && null !== (r = i.get(e, t)) ? r : e[t]
			},
			propHooks: {
				tabIndex: {
					get: function(e) {
						var t = de.find.attr(e, "tabindex");
						return t ? parseInt(t, 10) : bt.test(e.nodeName) || xt.test(e.nodeName) && e.href ? 0 : -1
					}
				}
			},
			propFix: {
				for: "htmlFor",
				class: "className"
			}
		}), fe.optSelected || (de.propHooks.selected = {
			get: function(e) {
				var t = e.parentNode;
				return t && t.parentNode && t.parentNode.selectedIndex, null
			},
			set: function(e) {
				var t = e.parentNode;
				t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex)
			}
		}), de.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
			de.propFix[this.toLowerCase()] = this
		}), de.fn.extend({
			addClass: function(e) {
				var t, n, r, i, o, s, a, u = 0;
				if (de.isFunction(e)) return this.each(function(t) {
					de(this).addClass(e.call(this, t, W(this)))
				});
				if ("string" == typeof e && e)
					for (t = e.match(Oe) || []; n = this[u++];)
						if (i = W(n), r = 1 === n.nodeType && " " + H(i) + " ") {
							for (s = 0; o = t[s++];) r.indexOf(" " + o + " ") < 0 && (r += o + " ");
							a = H(r), i !== a && n.setAttribute("class", a)
						}
				return this
			},
			removeClass: function(e) {
				var t, n, r, i, o, s, a, u = 0;
				if (de.isFunction(e)) return this.each(function(t) {
					de(this).removeClass(e.call(this, t, W(this)))
				});
				if (!arguments.length) return this.attr("class", "");
				if ("string" == typeof e && e)
					for (t = e.match(Oe) || []; n = this[u++];)
						if (i = W(n), r = 1 === n.nodeType && " " + H(i) + " ") {
							for (s = 0; o = t[s++];)
								for (; r.indexOf(" " + o + " ") > -1;) r = r.replace(" " + o + " ", " ");
							a = H(r), i !== a && n.setAttribute("class", a)
						}
				return this
			},
			toggleClass: function(e, t) {
				var n = typeof e;
				return "boolean" == typeof t && "string" === n ? t ? this.addClass(e) : this.removeClass(e) : de.isFunction(e) ? this.each(function(n) {
					de(this).toggleClass(e.call(this, n, W(this), t), t)
				}) : this.each(function() {
					var t, r, i, o;
					if ("string" === n)
						for (r = 0, i = de(this), o = e.match(Oe) || []; t = o[r++];) i.hasClass(t) ? i.removeClass(t) : i.addClass(t);
					else void 0 !== e && "boolean" !== n || (t = W(this), t && De.set(this, "__className__", t), this.setAttribute && this.setAttribute("class", t || e === !1 ? "" : De.get(this, "__className__") || ""))
				})
			},
			hasClass: function(e) {
				var t, n, r = 0;
				for (t = " " + e + " "; n = this[r++];)
					if (1 === n.nodeType && (" " + H(W(n)) + " ").indexOf(t) > -1) return !0;
				return !1
			}
		});
		var wt = /\r/g;
		de.fn.extend({
			val: function(e) {
				var t, n, r, i = this[0];
				return arguments.length ? (r = de.isFunction(e), this.each(function(n) {
					var i;
					1 === this.nodeType && (i = r ? e.call(this, n, de(this).val()) : e, null == i ? i = "" : "number" == typeof i ? i += "" : de.isArray(i) && (i = de.map(i, function(e) {
						return null == e ? "" : e + ""
					})), t = de.valHooks[this.type] || de.valHooks[this.nodeName.toLowerCase()], t && "set" in t && void 0 !== t.set(this, i, "value") || (this.value = i))
				})) : i ? (t = de.valHooks[i.type] || de.valHooks[i.nodeName.toLowerCase()], t && "get" in t && void 0 !== (n = t.get(i, "value")) ? n : (n = i.value, "string" == typeof n ? n.replace(wt, "") : null == n ? "" : n)) : void 0
			}
		}), de.extend({
			valHooks: {
				option: {
					get: function(e) {
						var t = de.find.attr(e, "value");
						return null != t ? t : H(de.text(e))
					}
				},
				select: {
					get: function(e) {
						var t, n, r, i = e.options,
							o = e.selectedIndex,
							s = "select-one" === e.type,
							a = s ? null : [],
							u = s ? o + 1 : i.length;
						for (r = o < 0 ? u : s ? o : 0; r < u; r++)
							if (n = i[r], (n.selected || r === o) && !n.disabled && (!n.parentNode.disabled || !de.nodeName(n.parentNode, "optgroup"))) {
								if (t = de(n).val(), s) return t;
								a.push(t)
							}
						return a
					},
					set: function(e, t) {
						for (var n, r, i = e.options, o = de.makeArray(t), s = i.length; s--;) r = i[s], (r.selected = de.inArray(de.valHooks.option.get(r), o) > -1) && (n = !0);
						return n || (e.selectedIndex = -1), o
					}
				}
			}
		}), de.each(["radio", "checkbox"], function() {
			de.valHooks[this] = {
				set: function(e, t) {
					if (de.isArray(t)) return e.checked = de.inArray(de(e).val(), t) > -1
				}
			}, fe.checkOn || (de.valHooks[this].get = function(e) {
				return null === e.getAttribute("value") ? "on" : e.value
			})
		});
		var _t = /^(?:focusinfocus|focusoutblur)$/;
		de.extend(de.event, {
			trigger: function(t, n, r, i) {
				var o, s, a, u, l, c, p, f = [r || te],
					h = le.call(t, "type") ? t.type : t,
					d = le.call(t, "namespace") ? t.namespace.split(".") : [];
				if (s = a = r = r || te, 3 !== r.nodeType && 8 !== r.nodeType && !_t.test(h + de.event.triggered) && (h.indexOf(".") > -1 && (d = h.split("."), h = d.shift(), d.sort()), l = h.indexOf(":") < 0 && "on" + h, t = t[de.expando] ? t : new de.Event(h, "object" == typeof t && t), t.isTrigger = i ? 2 : 3, t.namespace = d.join("."), t.rnamespace = t.namespace ? new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, t.result = void 0, t.target || (t.target = r), n = null == n ? [t] : de.makeArray(n, [t]), p = de.event.special[h] || {}, i || !p.trigger || p.trigger.apply(r, n) !== !1)) {
					if (!i && !p.noBubble && !de.isWindow(r)) {
						for (u = p.delegateType || h, _t.test(u + h) || (s = s.parentNode); s; s = s.parentNode) f.push(s), a = s;
						a === (r.ownerDocument || te) && f.push(a.defaultView || a.parentWindow || e)
					}
					for (o = 0;
						(s = f[o++]) && !t.isPropagationStopped();) t.type = o > 1 ? u : p.bindType || h, c = (De.get(s, "events") || {})[t.type] && De.get(s, "handle"), c && c.apply(s, n), c = l && s[l], c && c.apply && $e(s) && (t.result = c.apply(s, n), t.result === !1 && t.preventDefault());
					return t.type = h, i || t.isDefaultPrevented() || p._default && p._default.apply(f.pop(), n) !== !1 || !$e(r) || l && de.isFunction(r[h]) && !de.isWindow(r) && (a = r[l], a && (r[l] = null), de.event.triggered = h, r[h](), de.event.triggered = void 0, a && (r[l] = a)), t.result
				}
			},
			simulate: function(e, t, n) {
				var r = de.extend(new de.Event, n, {
					type: e,
					isSimulated: !0
				});
				de.event.trigger(r, null, t)
			}
		}), de.fn.extend({
			trigger: function(e, t) {
				return this.each(function() {
					de.event.trigger(e, t, this)
				})
			},
			triggerHandler: function(e, t) {
				var n = this[0];
				if (n) return de.event.trigger(e, t, n, !0)
			}
		}), de.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(e, t) {
			de.fn[t] = function(e, n) {
				return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
			}
		}), de.fn.extend({
			hover: function(e, t) {
				return this.mouseenter(e).mouseleave(t || e)
			}
		}), fe.focusin = "onfocusin" in e, fe.focusin || de.each({
			focus: "focusin",
			blur: "focusout"
		}, function(e, t) {
			var n = function(e) {
				de.event.simulate(t, e.target, de.event.fix(e))
			};
			de.event.special[t] = {
				setup: function() {
					var r = this.ownerDocument || this,
						i = De.access(r, t);
					i || r.addEventListener(e, n, !0), De.access(r, t, (i || 0) + 1)
				},
				teardown: function() {
					var r = this.ownerDocument || this,
						i = De.access(r, t) - 1;
					i ? De.access(r, t, i) : (r.removeEventListener(e, n, !0), De.remove(r, t))
				}
			}
		});
		var kt = e.location,
			Tt = de.now(),
			Et = /\?/;
		de.parseXML = function(t) {
			var n;
			if (!t || "string" != typeof t) return null;
			try {
				n = (new e.DOMParser).parseFromString(t, "text/xml")
			} catch (e) {
				n = void 0
			}
			return n && !n.getElementsByTagName("parsererror").length || de.error("Invalid XML: " + t), n
		};
		var Ct = /\[\]$/,
			At = /\r?\n/g,
			St = /^(?:submit|button|image|reset|file)$/i,
			jt = /^(?:input|select|textarea|keygen)/i;
		de.param = function(e, t) {
			var n, r = [],
				i = function(e, t) {
					var n = de.isFunction(t) ? t() : t;
					r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(null == n ? "" : n)
				};
			if (de.isArray(e) || e.jquery && !de.isPlainObject(e)) de.each(e, function() {
				i(this.name, this.value)
			});
			else
				for (n in e) G(n, e[n], t, i);
			return r.join("&")
		}, de.fn.extend({
			serialize: function() {
				return de.param(this.serializeArray())
			},
			serializeArray: function() {
				return this.map(function() {
					var e = de.prop(this, "elements");
					return e ? de.makeArray(e) : this
				}).filter(function() {
					var e = this.type;
					return this.name && !de(this).is(":disabled") && jt.test(this.nodeName) && !St.test(e) && (this.checked || !He.test(e))
				}).map(function(e, t) {
					var n = de(this).val();
					return null == n ? null : de.isArray(n) ? de.map(n, function(e) {
						return {
							name: t.name,
							value: e.replace(At, "\r\n")
						}
					}) : {
						name: t.name,
						value: n.replace(At, "\r\n")
					}
				}).get()
			}
		});
		var Ot = /%20/g,
			It = /#.*$/,
			Rt = /([?&])_=[^&]*/,
			Nt = /^(.*?):[ \t]*([^\r\n]*)$/gm,
			$t = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
			Dt = /^(?:GET|HEAD)$/,
			Mt = /^\/\//,
			Lt = {},
			Pt = {},
			Bt = "*/".concat("*"),
			qt = te.createElement("a");
		qt.href = kt.href, de.extend({
			active: 0,
			lastModified: {},
			etag: {},
			ajaxSettings: {
				url: kt.href,
				type: "GET",
				isLocal: $t.test(kt.protocol),
				global: !0,
				processData: !0,
				async: !0,
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				accepts: {
					"*": Bt,
					text: "text/plain",
					html: "text/html",
					xml: "application/xml, text/xml",
					json: "application/json, text/javascript"
				},
				contents: {
					xml: /\bxml\b/,
					html: /\bhtml/,
					json: /\bjson\b/
				},
				responseFields: {
					xml: "responseXML",
					text: "responseText",
					json: "responseJSON"
				},
				converters: {
					"* text": String,
					"text html": !0,
					"text json": JSON.parse,
					"text xml": de.parseXML
				},
				flatOptions: {
					url: !0,
					context: !0
				}
			},
			ajaxSetup: function(e, t) {
				return t ? Y(Y(e, de.ajaxSettings), t) : Y(de.ajaxSettings, e)
			},
			ajaxPrefilter: J(Lt),
			ajaxTransport: J(Pt),
			ajax: function(t, n) {
				function r(t, n, r, a) {
					var l, f, h, x, w, _ = n;
					c || (c = !0, u && e.clearTimeout(u), i = void 0, s = a || "", k.readyState = t > 0 ? 4 : 0, l = t >= 200 && t < 300 || 304 === t, r && (x = X(d, k, r)), x = K(d, x, k, l), l ? (d.ifModified && (w = k.getResponseHeader("Last-Modified"), w && (de.lastModified[o] = w), w = k.getResponseHeader("etag"), w && (de.etag[o] = w)), 204 === t || "HEAD" === d.type ? _ = "nocontent" : 304 === t ? _ = "notmodified" : (_ = x.state, f = x.data, h = x.error, l = !h)) : (h = _, !t && _ || (_ = "error", t < 0 && (t = 0))), k.status = t, k.statusText = (n || _) + "", l ? y.resolveWith(g, [f, _, k]) : y.rejectWith(g, [k, _, h]), k.statusCode(b), b = void 0, p && v.trigger(l ? "ajaxSuccess" : "ajaxError", [k, d, l ? f : h]), m.fireWith(g, [k, _]), p && (v.trigger("ajaxComplete", [k, d]), --de.active || de.event.trigger("ajaxStop")))
				}
				"object" == typeof t && (n = t, t = void 0), n = n || {};
				var i, o, s, a, u, l, c, p, f, h, d = de.ajaxSetup({}, n),
					g = d.context || d,
					v = d.context && (g.nodeType || g.jquery) ? de(g) : de.event,
					y = de.Deferred(),
					m = de.Callbacks("once memory"),
					b = d.statusCode || {},
					x = {},
					w = {},
					_ = "canceled",
					k = {
						readyState: 0,
						getResponseHeader: function(e) {
							var t;
							if (c) {
								if (!a)
									for (a = {}; t = Nt.exec(s);) a[t[1].toLowerCase()] = t[2];
								t = a[e.toLowerCase()]
							}
							return null == t ? null : t
						},
						getAllResponseHeaders: function() {
							return c ? s : null
						},
						setRequestHeader: function(e, t) {
							return null == c && (e = w[e.toLowerCase()] = w[e.toLowerCase()] || e, x[e] = t), this
						},
						overrideMimeType: function(e) {
							return null == c && (d.mimeType = e), this
						},
						statusCode: function(e) {
							var t;
							if (e)
								if (c) k.always(e[k.status]);
								else
									for (t in e) b[t] = [b[t], e[t]];
							return this
						},
						abort: function(e) {
							var t = e || _;
							return i && i.abort(t), r(0, t), this
						}
					};
				if (y.promise(k), d.url = ((t || d.url || kt.href) + "").replace(Mt, kt.protocol + "//"), d.type = n.method || n.type || d.method || d.type, d.dataTypes = (d.dataType || "*").toLowerCase().match(Oe) || [""], null == d.crossDomain) {
					l = te.createElement("a");
					try {
						l.href = d.url, l.href = l.href, d.crossDomain = qt.protocol + "//" + qt.host != l.protocol + "//" + l.host
					} catch (e) {
						d.crossDomain = !0
					}
				}
				if (d.data && d.processData && "string" != typeof d.data && (d.data = de.param(d.data, d.traditional)), Z(Lt, d, n, k), c) return k;
				p = de.event && d.global, p && 0 === de.active++ && de.event.trigger("ajaxStart"), d.type = d.type.toUpperCase(), d.hasContent = !Dt.test(d.type), o = d.url.replace(It, ""), d.hasContent ? d.data && d.processData && 0 === (d.contentType || "").indexOf("application/x-www-form-urlencoded") && (d.data = d.data.replace(Ot, "+")) : (h = d.url.slice(o.length), d.data && (o += (Et.test(o) ? "&" : "?") + d.data, delete d.data), d.cache === !1 && (o = o.replace(Rt, "$1"), h = (Et.test(o) ? "&" : "?") + "_=" + Tt++ + h), d.url = o + h), d.ifModified && (de.lastModified[o] && k.setRequestHeader("If-Modified-Since", de.lastModified[o]), de.etag[o] && k.setRequestHeader("If-None-Match", de.etag[o])), (d.data && d.hasContent && d.contentType !== !1 || n.contentType) && k.setRequestHeader("Content-Type", d.contentType), k.setRequestHeader("Accept", d.dataTypes[0] && d.accepts[d.dataTypes[0]] ? d.accepts[d.dataTypes[0]] + ("*" !== d.dataTypes[0] ? ", " + Bt + "; q=0.01" : "") : d.accepts["*"]);
				for (f in d.headers) k.setRequestHeader(f, d.headers[f]);
				if (d.beforeSend && (d.beforeSend.call(g, k, d) === !1 || c)) return k.abort();
				if (_ = "abort", m.add(d.complete), k.done(d.success), k.fail(d.error), i = Z(Pt, d, n, k)) {
					if (k.readyState = 1, p && v.trigger("ajaxSend", [k, d]), c) return k;
					d.async && d.timeout > 0 && (u = e.setTimeout(function() {
						k.abort("timeout")
					}, d.timeout));
					try {
						c = !1, i.send(x, r)
					} catch (e) {
						if (c) throw e;
						r(-1, e)
					}
				} else r(-1, "No Transport");
				return k
			},
			getJSON: function(e, t, n) {
				return de.get(e, t, n, "json")
			},
			getScript: function(e, t) {
				return de.get(e, void 0, t, "script")
			}
		}), de.each(["get", "post"], function(e, t) {
			de[t] = function(e, n, r, i) {
				return de.isFunction(n) && (i = i || r, r = n, n = void 0), de.ajax(de.extend({
					url: e,
					type: t,
					dataType: i,
					data: n,
					success: r
				}, de.isPlainObject(e) && e))
			}
		}), de._evalUrl = function(e) {
			return de.ajax({
				url: e,
				type: "GET",
				dataType: "script",
				cache: !0,
				async: !1,
				global: !1,
				throws: !0
			})
		}, de.fn.extend({
			wrapAll: function(e) {
				var t;
				return this[0] && (de.isFunction(e) && (e = e.call(this[0])), t = de(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
					for (var e = this; e.firstElementChild;) e = e.firstElementChild;
					return e
				}).append(this)), this
			},
			wrapInner: function(e) {
				return de.isFunction(e) ? this.each(function(t) {
					de(this).wrapInner(e.call(this, t))
				}) : this.each(function() {
					var t = de(this),
						n = t.contents();
					n.length ? n.wrapAll(e) : t.append(e);
				})
			},
			wrap: function(e) {
				var t = de.isFunction(e);
				return this.each(function(n) {
					de(this).wrapAll(t ? e.call(this, n) : e)
				})
			},
			unwrap: function(e) {
				return this.parent(e).not("body").each(function() {
					de(this).replaceWith(this.childNodes)
				}), this
			}
		}), de.expr.pseudos.hidden = function(e) {
			return !de.expr.pseudos.visible(e)
		}, de.expr.pseudos.visible = function(e) {
			return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length)
		}, de.ajaxSettings.xhr = function() {
			try {
				return new e.XMLHttpRequest
			} catch (e) {}
		};
		var Ft = {
				0: 200,
				1223: 204
			},
			Vt = de.ajaxSettings.xhr();
		fe.cors = !!Vt && "withCredentials" in Vt, fe.ajax = Vt = !!Vt, de.ajaxTransport(function(t) {
			var n, r;
			if (fe.cors || Vt && !t.crossDomain) return {
				send: function(i, o) {
					var s, a = t.xhr();
					if (a.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields)
						for (s in t.xhrFields) a[s] = t.xhrFields[s];
					t.mimeType && a.overrideMimeType && a.overrideMimeType(t.mimeType), t.crossDomain || i["X-Requested-With"] || (i["X-Requested-With"] = "XMLHttpRequest");
					for (s in i) a.setRequestHeader(s, i[s]);
					n = function(e) {
						return function() {
							n && (n = r = a.onload = a.onerror = a.onabort = a.onreadystatechange = null, "abort" === e ? a.abort() : "error" === e ? "number" != typeof a.status ? o(0, "error") : o(a.status, a.statusText) : o(Ft[a.status] || a.status, a.statusText, "text" !== (a.responseType || "text") || "string" != typeof a.responseText ? {
								binary: a.response
							} : {
								text: a.responseText
							}, a.getAllResponseHeaders()))
						}
					}, a.onload = n(), r = a.onerror = n("error"), void 0 !== a.onabort ? a.onabort = r : a.onreadystatechange = function() {
						4 === a.readyState && e.setTimeout(function() {
							n && r()
						})
					}, n = n("abort");
					try {
						a.send(t.hasContent && t.data || null)
					} catch (e) {
						if (n) throw e
					}
				},
				abort: function() {
					n && n()
				}
			}
		}), de.ajaxPrefilter(function(e) {
			e.crossDomain && (e.contents.script = !1)
		}), de.ajaxSetup({
			accepts: {
				script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
			},
			contents: {
				script: /\b(?:java|ecma)script\b/
			},
			converters: {
				"text script": function(e) {
					return de.globalEval(e), e
				}
			}
		}), de.ajaxPrefilter("script", function(e) {
			void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET")
		}), de.ajaxTransport("script", function(e) {
			if (e.crossDomain) {
				var t, n;
				return {
					send: function(r, i) {
						t = de("<script>").prop({
							charset: e.scriptCharset,
							src: e.url
						}).on("load error", n = function(e) {
							t.remove(), n = null, e && i("error" === e.type ? 404 : 200, e.type)
						}), te.head.appendChild(t[0])
					},
					abort: function() {
						n && n()
					}
				}
			}
		});
		var Ut = [],
			zt = /(=)\?(?=&|$)|\?\?/;
		de.ajaxSetup({
			jsonp: "callback",
			jsonpCallback: function() {
				var e = Ut.pop() || de.expando + "_" + Tt++;
				return this[e] = !0, e
			}
		}), de.ajaxPrefilter("json jsonp", function(t, n, r) {
			var i, o, s, a = t.jsonp !== !1 && (zt.test(t.url) ? "url" : "string" == typeof t.data && 0 === (t.contentType || "").indexOf("application/x-www-form-urlencoded") && zt.test(t.data) && "data");
			if (a || "jsonp" === t.dataTypes[0]) return i = t.jsonpCallback = de.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback, a ? t[a] = t[a].replace(zt, "$1" + i) : t.jsonp !== !1 && (t.url += (Et.test(t.url) ? "&" : "?") + t.jsonp + "=" + i), t.converters["script json"] = function() {
				return s || de.error(i + " was not called"), s[0]
			}, t.dataTypes[0] = "json", o = e[i], e[i] = function() {
				s = arguments
			}, r.always(function() {
				void 0 === o ? de(e).removeProp(i) : e[i] = o, t[i] && (t.jsonpCallback = n.jsonpCallback, Ut.push(i)), s && de.isFunction(o) && o(s[0]), s = o = void 0
			}), "script"
		}), fe.createHTMLDocument = function() {
			var e = te.implementation.createHTMLDocument("").body;
			return e.innerHTML = "<form></form><form></form>", 2 === e.childNodes.length
		}(), de.parseHTML = function(e, t, n) {
			if ("string" != typeof e) return [];
			"boolean" == typeof t && (n = t, t = !1);
			var r, i, o;
			return t || (fe.createHTMLDocument ? (t = te.implementation.createHTMLDocument(""), r = t.createElement("base"), r.href = te.location.href, t.head.appendChild(r)) : t = te), i = ke.exec(e), o = !n && [], i ? [t.createElement(i[1])] : (i = b([e], t, o), o && o.length && de(o).remove(), de.merge([], i.childNodes))
		}, de.fn.load = function(e, t, n) {
			var r, i, o, s = this,
				a = e.indexOf(" ");
			return a > -1 && (r = H(e.slice(a)), e = e.slice(0, a)), de.isFunction(t) ? (n = t, t = void 0) : t && "object" == typeof t && (i = "POST"), s.length > 0 && de.ajax({
				url: e,
				type: i || "GET",
				dataType: "html",
				data: t
			}).done(function(e) {
				o = arguments, s.html(r ? de("<div>").append(de.parseHTML(e)).find(r) : e)
			}).always(n && function(e, t) {
				s.each(function() {
					n.apply(this, o || [e.responseText, t, e])
				})
			}), this
		}, de.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
			de.fn[t] = function(e) {
				return this.on(t, e)
			}
		}), de.expr.pseudos.animated = function(e) {
			return de.grep(de.timers, function(t) {
				return e === t.elem
			}).length
		}, de.offset = {
			setOffset: function(e, t, n) {
				var r, i, o, s, a, u, l, c = de.css(e, "position"),
					p = de(e),
					f = {};
				"static" === c && (e.style.position = "relative"), a = p.offset(), o = de.css(e, "top"), u = de.css(e, "left"), l = ("absolute" === c || "fixed" === c) && (o + u).indexOf("auto") > -1, l ? (r = p.position(), s = r.top, i = r.left) : (s = parseFloat(o) || 0, i = parseFloat(u) || 0), de.isFunction(t) && (t = t.call(e, n, de.extend({}, a))), null != t.top && (f.top = t.top - a.top + s), null != t.left && (f.left = t.left - a.left + i), "using" in t ? t.using.call(e, f) : p.css(f)
			}
		}, de.fn.extend({
			offset: function(e) {
				if (arguments.length) return void 0 === e ? this : this.each(function(t) {
					de.offset.setOffset(this, e, t)
				});
				var t, n, r, i, o = this[0];
				return o ? o.getClientRects().length ? (r = o.getBoundingClientRect(), r.width || r.height ? (i = o.ownerDocument, n = Q(i), t = i.documentElement, {
					top: r.top + n.pageYOffset - t.clientTop,
					left: r.left + n.pageXOffset - t.clientLeft
				}) : r) : {
					top: 0,
					left: 0
				} : void 0
			},
			position: function() {
				if (this[0]) {
					var e, t, n = this[0],
						r = {
							top: 0,
							left: 0
						};
					return "fixed" === de.css(n, "position") ? t = n.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), de.nodeName(e[0], "html") || (r = e.offset()), r = {
						top: r.top + de.css(e[0], "borderTopWidth", !0),
						left: r.left + de.css(e[0], "borderLeftWidth", !0)
					}), {
						top: t.top - r.top - de.css(n, "marginTop", !0),
						left: t.left - r.left - de.css(n, "marginLeft", !0)
					}
				}
			},
			offsetParent: function() {
				return this.map(function() {
					for (var e = this.offsetParent; e && "static" === de.css(e, "position");) e = e.offsetParent;
					return e || Ye
				})
			}
		}), de.each({
			scrollLeft: "pageXOffset",
			scrollTop: "pageYOffset"
		}, function(e, t) {
			var n = "pageYOffset" === t;
			de.fn[e] = function(r) {
				return Ne(this, function(e, r, i) {
					var o = Q(e);
					return void 0 === i ? o ? o[t] : e[r] : void(o ? o.scrollTo(n ? o.pageXOffset : i, n ? i : o.pageYOffset) : e[r] = i)
				}, e, r, arguments.length)
			}
		}), de.each(["top", "left"], function(e, t) {
			de.cssHooks[t] = R(fe.pixelPosition, function(e, n) {
				if (n) return n = I(e, t), st.test(n) ? de(e).position()[t] + "px" : n
			})
		}), de.each({
			Height: "height",
			Width: "width"
		}, function(e, t) {
			de.each({
				padding: "inner" + e,
				content: t,
				"": "outer" + e
			}, function(n, r) {
				de.fn[r] = function(i, o) {
					var s = arguments.length && (n || "boolean" != typeof i),
						a = n || (i === !0 || o === !0 ? "margin" : "border");
					return Ne(this, function(t, n, i) {
						var o;
						return de.isWindow(t) ? 0 === r.indexOf("outer") ? t["inner" + e] : t.document.documentElement["client" + e] : 9 === t.nodeType ? (o = t.documentElement, Math.max(t.body["scroll" + e], o["scroll" + e], t.body["offset" + e], o["offset" + e], o["client" + e])) : void 0 === i ? de.css(t, n, a) : de.style(t, n, i, a)
					}, t, s ? i : void 0, s)
				}
			})
		}), de.fn.extend({
			bind: function(e, t, n) {
				return this.on(e, null, t, n)
			},
			unbind: function(e, t) {
				return this.off(e, null, t)
			},
			delegate: function(e, t, n, r) {
				return this.on(t, e, n, r)
			},
			undelegate: function(e, t, n) {
				return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
			}
		}), de.parseJSON = JSON.parse, "function" == typeof define && define.amd && define("jquery", [], function() {
			return de
		});
		var Ht = e.jQuery,
			Wt = e.$;
		return de.noConflict = function(t) {
			return e.$ === de && (e.$ = Wt), t && e.jQuery === de && (e.jQuery = Ht), de
		}, t || (e.jQuery = e.$ = de), de
	}), function(e) {
		var t = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global;
		if ("function" == typeof define && define.amd) define("backbone", ["underscore", "jquery", "exports"], function(n, r, i) {
			t.Backbone = e(t, i, n, r)
		});
		else if ("undefined" != typeof exports) {
			var n, r = require("underscore");
			try {
				n = require("jquery")
			} catch (e) {}
			e(t, exports, r, n)
		} else t.Backbone = e(t, {}, t._, t.jQuery || t.Zepto || t.ender || t.$)
	}(function(e, t, n, r) {
		var i = e.Backbone,
			o = Array.prototype.slice;
		t.VERSION = "1.3.3", t.$ = r, t.noConflict = function() {
			return e.Backbone = i, this
		}, t.emulateHTTP = !1, t.emulateJSON = !1;
		var s = function(e, t, r) {
				switch (e) {
					case 1:
						return function() {
							return n[t](this[r])
						};
					case 2:
						return function(e) {
							return n[t](this[r], e)
						};
					case 3:
						return function(e, i) {
							return n[t](this[r], u(e, this), i)
						};
					case 4:
						return function(e, i, o) {
							return n[t](this[r], u(e, this), i, o)
						};
					default:
						return function() {
							var e = o.call(arguments);
							return e.unshift(this[r]), n[t].apply(n, e)
						}
				}
			},
			a = function(e, t, r) {
				n.each(t, function(t, i) {
					n[i] && (e.prototype[i] = s(t, i, r))
				})
			},
			u = function(e, t) {
				return n.isFunction(e) ? e : n.isObject(e) && !t._isModel(e) ? l(e) : n.isString(e) ? function(t) {
					return t.get(e)
				} : e
			},
			l = function(e) {
				var t = n.matches(e);
				return function(e) {
					return t(e.attributes)
				}
			},
			c = t.Events = {},
			p = /\s+/,
			f = function(e, t, r, i, o) {
				var s, a = 0;
				if (r && "object" == typeof r) {
					void 0 !== i && "context" in o && void 0 === o.context && (o.context = i);
					for (s = n.keys(r); a < s.length; a++) t = f(e, t, s[a], r[s[a]], o)
				} else if (r && p.test(r))
					for (s = r.split(p); a < s.length; a++) t = e(t, s[a], i, o);
				else t = e(t, r, i, o);
				return t
			};
		c.on = function(e, t, n) {
			return h(this, e, t, n)
		};
		var h = function(e, t, n, r, i) {
			if (e._events = f(d, e._events || {}, t, n, {
					context: r,
					ctx: e,
					listening: i
				}), i) {
				var o = e._listeners || (e._listeners = {});
				o[i.id] = i
			}
			return e
		};
		c.listenTo = function(e, t, r) {
			if (!e) return this;
			var i = e._listenId || (e._listenId = n.uniqueId("l")),
				o = this._listeningTo || (this._listeningTo = {}),
				s = o[i];
			if (!s) {
				var a = this._listenId || (this._listenId = n.uniqueId("l"));
				s = o[i] = {
					obj: e,
					objId: i,
					id: a,
					listeningTo: o,
					count: 0
				}
			}
			return h(e, t, r, this, s), this
		};
		var d = function(e, t, n, r) {
			if (n) {
				var i = e[t] || (e[t] = []),
					o = r.context,
					s = r.ctx,
					a = r.listening;
				a && a.count++, i.push({
					callback: n,
					context: o,
					ctx: o || s,
					listening: a
				})
			}
			return e
		};
		c.off = function(e, t, n) {
			return this._events ? (this._events = f(g, this._events, e, t, {
				context: n,
				listeners: this._listeners
			}), this) : this
		}, c.stopListening = function(e, t, r) {
			var i = this._listeningTo;
			if (!i) return this;
			for (var o = e ? [e._listenId] : n.keys(i), s = 0; s < o.length; s++) {
				var a = i[o[s]];
				if (!a) break;
				a.obj.off(t, r, this)
			}
			return this
		};
		var g = function(e, t, r, i) {
			if (e) {
				var o, s = 0,
					a = i.context,
					u = i.listeners;
				if (t || r || a) {
					for (var l = t ? [t] : n.keys(e); s < l.length; s++) {
						t = l[s];
						var c = e[t];
						if (!c) break;
						for (var p = [], f = 0; f < c.length; f++) {
							var h = c[f];
							r && r !== h.callback && r !== h.callback._callback || a && a !== h.context ? p.push(h) : (o = h.listening, o && 0 === --o.count && (delete u[o.id], delete o.listeningTo[o.objId]))
						}
						p.length ? e[t] = p : delete e[t]
					}
					return e
				}
				for (var d = n.keys(u); s < d.length; s++) o = u[d[s]], delete u[o.id], delete o.listeningTo[o.objId]
			}
		};
		c.once = function(e, t, r) {
			var i = f(v, {}, e, t, n.bind(this.off, this));
			return "string" == typeof e && null == r && (t = void 0), this.on(i, t, r)
		}, c.listenToOnce = function(e, t, r) {
			var i = f(v, {}, t, r, n.bind(this.stopListening, this, e));
			return this.listenTo(e, i)
		};
		var v = function(e, t, r, i) {
			if (r) {
				var o = e[t] = n.once(function() {
					i(t, o), r.apply(this, arguments)
				});
				o._callback = r
			}
			return e
		};
		c.trigger = function(e) {
			if (!this._events) return this;
			for (var t = Math.max(0, arguments.length - 1), n = Array(t), r = 0; r < t; r++) n[r] = arguments[r + 1];
			return f(y, this._events, e, void 0, n), this
		};
		var y = function(e, t, n, r) {
				if (e) {
					var i = e[t],
						o = e.all;
					i && o && (o = o.slice()), i && m(i, r), o && m(o, [t].concat(r))
				}
				return e
			},
			m = function(e, t) {
				var n, r = -1,
					i = e.length,
					o = t[0],
					s = t[1],
					a = t[2];
				switch (t.length) {
					case 0:
						for (; ++r < i;)(n = e[r]).callback.call(n.ctx);
						return;
					case 1:
						for (; ++r < i;)(n = e[r]).callback.call(n.ctx, o);
						return;
					case 2:
						for (; ++r < i;)(n = e[r]).callback.call(n.ctx, o, s);
						return;
					case 3:
						for (; ++r < i;)(n = e[r]).callback.call(n.ctx, o, s, a);
						return;
					default:
						for (; ++r < i;)(n = e[r]).callback.apply(n.ctx, t);
						return
				}
			};
		c.bind = c.on, c.unbind = c.off, n.extend(t, c);
		var b = t.Model = function(e, t) {
			var r = e || {};
			t || (t = {}), this.cid = n.uniqueId(this.cidPrefix), this.attributes = {}, t.collection && (this.collection = t.collection), t.parse && (r = this.parse(r, t) || {});
			var i = n.result(this, "defaults");
			r = n.defaults(n.extend({}, i, r), i), this.set(r, t), this.changed = {}, this.initialize.apply(this, arguments)
		};
		n.extend(b.prototype, c, {
			changed: null,
			validationError: null,
			idAttribute: "id",
			cidPrefix: "c",
			initialize: function() {},
			toJSON: function(e) {
				return n.clone(this.attributes)
			},
			sync: function() {
				return t.sync.apply(this, arguments)
			},
			get: function(e) {
				return this.attributes[e]
			},
			escape: function(e) {
				return n.escape(this.get(e))
			},
			has: function(e) {
				return null != this.get(e)
			},
			matches: function(e) {
				return !!n.iteratee(e, this)(this.attributes)
			},
			set: function(e, t, r) {
				if (null == e) return this;
				var i;
				if ("object" == typeof e ? (i = e, r = t) : (i = {})[e] = t, r || (r = {}), !this._validate(i, r)) return !1;
				var o = r.unset,
					s = r.silent,
					a = [],
					u = this._changing;
				this._changing = !0, u || (this._previousAttributes = n.clone(this.attributes), this.changed = {});
				var l = this.attributes,
					c = this.changed,
					p = this._previousAttributes;
				for (var f in i) t = i[f], n.isEqual(l[f], t) || a.push(f), n.isEqual(p[f], t) ? delete c[f] : c[f] = t, o ? delete l[f] : l[f] = t;
				if (this.idAttribute in i && (this.id = this.get(this.idAttribute)), !s) {
					a.length && (this._pending = r);
					for (var h = 0; h < a.length; h++) this.trigger("change:" + a[h], this, l[a[h]], r)
				}
				if (u) return this;
				if (!s)
					for (; this._pending;) r = this._pending, this._pending = !1, this.trigger("change", this, r);
				return this._pending = !1, this._changing = !1, this
			},
			unset: function(e, t) {
				return this.set(e, void 0, n.extend({}, t, {
					unset: !0
				}))
			},
			clear: function(e) {
				var t = {};
				for (var r in this.attributes) t[r] = void 0;
				return this.set(t, n.extend({}, e, {
					unset: !0
				}))
			},
			hasChanged: function(e) {
				return null == e ? !n.isEmpty(this.changed) : n.has(this.changed, e)
			},
			changedAttributes: function(e) {
				if (!e) return !!this.hasChanged() && n.clone(this.changed);
				var t = this._changing ? this._previousAttributes : this.attributes,
					r = {};
				for (var i in e) {
					var o = e[i];
					n.isEqual(t[i], o) || (r[i] = o)
				}
				return !!n.size(r) && r
			},
			previous: function(e) {
				return null != e && this._previousAttributes ? this._previousAttributes[e] : null
			},
			previousAttributes: function() {
				return n.clone(this._previousAttributes)
			},
			fetch: function(e) {
				e = n.extend({
					parse: !0
				}, e);
				var t = this,
					r = e.success;
				return e.success = function(n) {
					var i = e.parse ? t.parse(n, e) : n;
					return !!t.set(i, e) && (r && r.call(e.context, t, n, e), void t.trigger("sync", t, n, e))
				}, F(this, e), this.sync("read", this, e)
			},
			save: function(e, t, r) {
				var i;
				null == e || "object" == typeof e ? (i = e, r = t) : (i = {})[e] = t, r = n.extend({
					validate: !0,
					parse: !0
				}, r);
				var o = r.wait;
				if (i && !o) {
					if (!this.set(i, r)) return !1
				} else if (!this._validate(i, r)) return !1;
				var s = this,
					a = r.success,
					u = this.attributes;
				r.success = function(e) {
					s.attributes = u;
					var t = r.parse ? s.parse(e, r) : e;
					return o && (t = n.extend({}, i, t)), !(t && !s.set(t, r)) && (a && a.call(r.context, s, e, r), void s.trigger("sync", s, e, r))
				}, F(this, r), i && o && (this.attributes = n.extend({}, u, i));
				var l = this.isNew() ? "create" : r.patch ? "patch" : "update";
				"patch" !== l || r.attrs || (r.attrs = i);
				var c = this.sync(l, this, r);
				return this.attributes = u, c
			},
			destroy: function(e) {
				e = e ? n.clone(e) : {};
				var t = this,
					r = e.success,
					i = e.wait,
					o = function() {
						t.stopListening(), t.trigger("destroy", t, t.collection, e)
					};
				e.success = function(n) {
					i && o(), r && r.call(e.context, t, n, e), t.isNew() || t.trigger("sync", t, n, e)
				};
				var s = !1;
				return this.isNew() ? n.defer(e.success) : (F(this, e), s = this.sync("delete", this, e)), i || o(), s
			},
			url: function() {
				var e = n.result(this, "urlRoot") || n.result(this.collection, "url") || q();
				if (this.isNew()) return e;
				var t = this.get(this.idAttribute);
				return e.replace(/[^\/]$/, "'{{MAIN_SCRIPT}}'/") + encodeURIComponent(t)
			},
			parse: function(e, t) {
				return e
			},
			clone: function() {
				return new this.constructor(this.attributes)
			},
			isNew: function() {
				return !this.has(this.idAttribute)
			},
			isValid: function(e) {
				return this._validate({}, n.extend({}, e, {
					validate: !0
				}))
			},
			_validate: function(e, t) {
				if (!t.validate || !this.validate) return !0;
				e = n.extend({}, this.attributes, e);
				var r = this.validationError = this.validate(e, t) || null;
				return !r || (this.trigger("invalid", this, r, n.extend(t, {
					validationError: r
				})), !1)
			}
		});
		var x = {
			keys: 1,
			values: 1,
			pairs: 1,
			invert: 1,
			pick: 0,
			omit: 0,
			chain: 1,
			isEmpty: 1
		};
		a(b, x, "attributes");
		var w = t.Collection = function(e, t) {
				t || (t = {}), t.model && (this.model = t.model), void 0 !== t.comparator && (this.comparator = t.comparator), this._reset(), this.initialize.apply(this, arguments), e && this.reset(e, n.extend({
					silent: !0
				}, t))
			},
			_ = {
				add: !0,
				remove: !0,
				merge: !0
			},
			k = {
				add: !0,
				remove: !1
			},
			T = function(e, t, n) {
				n = Math.min(Math.max(n, 0), e.length);
				var r, i = Array(e.length - n),
					o = t.length;
				for (r = 0; r < i.length; r++) i[r] = e[r + n];
				for (r = 0; r < o; r++) e[r + n] = t[r];
				for (r = 0; r < i.length; r++) e[r + o + n] = i[r]
			};
		n.extend(w.prototype, c, {
			model: b,
			initialize: function() {},
			toJSON: function(e) {
				return this.map(function(t) {
					return t.toJSON(e)
				})
			},
			sync: function() {
				return t.sync.apply(this, arguments)
			},
			add: function(e, t) {
				return this.set(e, n.extend({
					merge: !1
				}, t, k))
			},
			remove: function(e, t) {
				t = n.extend({}, t);
				var r = !n.isArray(e);
				e = r ? [e] : e.slice();
				var i = this._removeModels(e, t);
				return !t.silent && i.length && (t.changes = {
					added: [],
					merged: [],
					removed: i
				}, this.trigger("update", this, t)), r ? i[0] : i
			},
			set: function(e, t) {
				if (null != e) {
					t = n.extend({}, _, t), t.parse && !this._isModel(e) && (e = this.parse(e, t) || []);
					var r = !n.isArray(e);
					e = r ? [e] : e.slice();
					var i = t.at;
					null != i && (i = +i), i > this.length && (i = this.length), i < 0 && (i += this.length + 1);
					var o, s, a = [],
						u = [],
						l = [],
						c = [],
						p = {},
						f = t.add,
						h = t.merge,
						d = t.remove,
						g = !1,
						v = this.comparator && null == i && t.sort !== !1,
						y = n.isString(this.comparator) ? this.comparator : null;
					for (s = 0; s < e.length; s++) {
						o = e[s];
						var m = this.get(o);
						if (m) {
							if (h && o !== m) {
								var b = this._isModel(o) ? o.attributes : o;
								t.parse && (b = m.parse(b, t)), m.set(b, t), l.push(m), v && !g && (g = m.hasChanged(y))
							}
							p[m.cid] || (p[m.cid] = !0, a.push(m)), e[s] = m
						} else f && (o = e[s] = this._prepareModel(o, t), o && (u.push(o), this._addReference(o, t), p[o.cid] = !0, a.push(o)))
					}
					if (d) {
						for (s = 0; s < this.length; s++) o = this.models[s], p[o.cid] || c.push(o);
						c.length && this._removeModels(c, t)
					}
					var x = !1,
						w = !v && f && d;
					if (a.length && w ? (x = this.length !== a.length || n.some(this.models, function(e, t) {
							return e !== a[t]
						}), this.models.length = 0, T(this.models, a, 0), this.length = this.models.length) : u.length && (v && (g = !0), T(this.models, u, null == i ? this.length : i), this.length = this.models.length), g && this.sort({
							silent: !0
						}), !t.silent) {
						for (s = 0; s < u.length; s++) null != i && (t.index = i + s), o = u[s], o.trigger("add", o, this, t);
						(g || x) && this.trigger("sort", this, t), (u.length || c.length || l.length) && (t.changes = {
							added: u,
							removed: c,
							merged: l
						}, this.trigger("update", this, t))
					}
					return r ? e[0] : e
				}
			},
			reset: function(e, t) {
				t = t ? n.clone(t) : {};
				for (var r = 0; r < this.models.length; r++) this._removeReference(this.models[r], t);
				return t.previousModels = this.models, this._reset(), e = this.add(e, n.extend({
					silent: !0
				}, t)), t.silent || this.trigger("reset", this, t), e
			},
			push: function(e, t) {
				return this.add(e, n.extend({
					at: this.length
				}, t))
			},
			pop: function(e) {
				var t = this.at(this.length - 1);
				return this.remove(t, e)
			},
			unshift: function(e, t) {
				return this.add(e, n.extend({
					at: 0
				}, t))
			},
			shift: function(e) {
				var t = this.at(0);
				return this.remove(t, e)
			},
			slice: function() {
				return o.apply(this.models, arguments)
			},
			get: function(e) {
				if (null != e) return this._byId[e] || this._byId[this.modelId(e.attributes || e)] || e.cid && this._byId[e.cid]
			},
			has: function(e) {
				return null != this.get(e)
			},
			at: function(e) {
				return e < 0 && (e += this.length), this.models[e]
			},
			where: function(e, t) {
				return this[t ? "find" : "filter"](e)
			},
			findWhere: function(e) {
				return this.where(e, !0)
			},
			sort: function(e) {
				var t = this.comparator;
				if (!t) throw new Error("Cannot sort a set without a comparator");
				e || (e = {});
				var r = t.length;
				return n.isFunction(t) && (t = n.bind(t, this)), 1 === r || n.isString(t) ? this.models = this.sortBy(t) : this.models.sort(t), e.silent || this.trigger("sort", this, e), this
			},
			pluck: function(e) {
				return this.map(e + "")
			},
			fetch: function(e) {
				e = n.extend({
					parse: !0
				}, e);
				var t = e.success,
					r = this;
				return e.success = function(n) {
					var i = e.reset ? "reset" : "set";
					r[i](n, e), t && t.call(e.context, r, n, e), r.trigger("sync", r, n, e)
				}, F(this, e), this.sync("read", this, e)
			},
			create: function(e, t) {
				t = t ? n.clone(t) : {};
				var r = t.wait;
				if (e = this._prepareModel(e, t), !e) return !1;
				r || this.add(e, t);
				var i = this,
					o = t.success;
				return t.success = function(e, t, n) {
					r && i.add(e, n), o && o.call(n.context, e, t, n)
				}, e.save(null, t), e
			},
			parse: function(e, t) {
				return e
			},
			clone: function() {
				return new this.constructor(this.models, {
					model: this.model,
					comparator: this.comparator
				})
			},
			modelId: function(e) {
				return e[this.model.prototype.idAttribute || "id"]
			},
			_reset: function() {
				this.length = 0, this.models = [], this._byId = {}
			},
			_prepareModel: function(e, t) {
				if (this._isModel(e)) return e.collection || (e.collection = this), e;
				t = t ? n.clone(t) : {}, t.collection = this;
				var r = new this.model(e, t);
				return r.validationError ? (this.trigger("invalid", this, r.validationError, t), !1) : r
			},
			_removeModels: function(e, t) {
				for (var n = [], r = 0; r < e.length; r++) {
					var i = this.get(e[r]);
					if (i) {
						var o = this.indexOf(i);
						this.models.splice(o, 1), this.length--, delete this._byId[i.cid];
						var s = this.modelId(i.attributes);
						null != s && delete this._byId[s], t.silent || (t.index = o, i.trigger("remove", i, this, t)), n.push(i), this._removeReference(i, t)
					}
				}
				return n
			},
			_isModel: function(e) {
				return e instanceof b
			},
			_addReference: function(e, t) {
				this._byId[e.cid] = e;
				var n = this.modelId(e.attributes);
				null != n && (this._byId[n] = e), e.on("all", this._onModelEvent, this)
			},
			_removeReference: function(e, t) {
				delete this._byId[e.cid];
				var n = this.modelId(e.attributes);
				null != n && delete this._byId[n], this === e.collection && delete e.collection, e.off("all", this._onModelEvent, this)
			},
			_onModelEvent: function(e, t, n, r) {
				if (t) {
					if (("add" === e || "remove" === e) && n !== this) return;
					if ("destroy" === e && this.remove(t, r), "change" === e) {
						var i = this.modelId(t.previousAttributes()),
							o = this.modelId(t.attributes);
						i !== o && (null != i && delete this._byId[i], null != o && (this._byId[o] = t))
					}
				}
				this.trigger.apply(this, arguments)
			}
		});
		var E = {
			forEach: 3,
			each: 3,
			map: 3,
			collect: 3,
			reduce: 0,
			foldl: 0,
			inject: 0,
			reduceRight: 0,
			foldr: 0,
			find: 3,
			detect: 3,
			filter: 3,
			select: 3,
			reject: 3,
			every: 3,
			all: 3,
			some: 3,
			any: 3,
			include: 3,
			includes: 3,
			contains: 3,
			invoke: 0,
			max: 3,
			min: 3,
			toArray: 1,
			size: 1,
			first: 3,
			head: 3,
			take: 3,
			initial: 3,
			rest: 3,
			tail: 3,
			drop: 3,
			last: 3,
			without: 0,
			difference: 0,
			indexOf: 3,
			shuffle: 1,
			lastIndexOf: 3,
			isEmpty: 1,
			chain: 1,
			sample: 3,
			partition: 3,
			groupBy: 3,
			countBy: 3,
			sortBy: 3,
			indexBy: 3,
			findIndex: 3,
			findLastIndex: 3
		};
		a(w, E, "models");
		var C = t.View = function(e) {
				this.cid = n.uniqueId("view"), n.extend(this, n.pick(e, S)), this._ensureElement(), this.initialize.apply(this, arguments)
			},
			A = /^(\S+)\s*(.*)$/,
			S = ["model", "collection", "el", "id", "attributes", "className", "tagName", "events"];
		n.extend(C.prototype, c, {
			tagName: "div",
			$: function(e) {
				return this.$el.find(e)
			},
			initialize: function() {},
			render: function() {
				return this
			},
			remove: function() {
				return this._removeElement(), this.stopListening(), this
			},
			_removeElement: function() {
				this.$el.remove()
			},
			setElement: function(e) {
				return this.undelegateEvents(), this._setElement(e), this.delegateEvents(), this
			},
			_setElement: function(e) {
				this.$el = e instanceof t.$ ? e : t.$(e), this.el = this.$el[0]
			},
			delegateEvents: function(e) {
				if (e || (e = n.result(this, "events")), !e) return this;
				this.undelegateEvents();
				for (var t in e) {
					var r = e[t];
					if (n.isFunction(r) || (r = this[r]), r) {
						var i = t.match(A);
						this.delegate(i[1], i[2], n.bind(r, this))
					}
				}
				return this
			},
			delegate: function(e, t, n) {
				return this.$el.on(e + ".delegateEvents" + this.cid, t, n), this
			},
			undelegateEvents: function() {
				return this.$el && this.$el.off(".delegateEvents" + this.cid), this
			},
			undelegate: function(e, t, n) {
				return this.$el.off(e + ".delegateEvents" + this.cid, t, n), this
			},
			_createElement: function(e) {
				return document.createElement(e)
			},
			_ensureElement: function() {
				if (this.el) this.setElement(n.result(this, "el"));
				else {
					var e = n.extend({}, n.result(this, "attributes"));
					this.id && (e.id = n.result(this, "id")), this.className && (e.class = n.result(this, "className")), this.setElement(this._createElement(n.result(this, "tagName"))), this._setAttributes(e)
				}
			},
			_setAttributes: function(e) {
				this.$el.attr(e)
			}
		}), t.sync = function(e, r, i) {
			var o = j[e];
			n.defaults(i || (i = {}), {
				emulateHTTP: t.emulateHTTP,
				emulateJSON: t.emulateJSON
			});
			var s = {
				type: o,
				dataType: "json"
			};
			if (i.url || (s.url = n.result(r, "url") || q()), null != i.data || !r || "create" !== e && "update" !== e && "patch" !== e || (s.contentType = "application/json", s.data = JSON.stringify(i.attrs || r.toJSON(i))), i.emulateJSON && (s.contentType = "application/x-www-form-urlencoded", s.data = s.data ? {
					model: s.data
				} : {}), i.emulateHTTP && ("PUT" === o || "DELETE" === o || "PATCH" === o)) {
				s.type = "POST", i.emulateJSON && (s.data._method = o);
				var a = i.beforeSend;
				i.beforeSend = function(e) {
					if (e.setRequestHeader("X-HTTP-Method-Override", o), a) return a.apply(this, arguments)
				}
			}
			"GET" === s.type || i.emulateJSON || (s.processData = !1);
			var u = i.error;
			i.error = function(e, t, n) {
				i.textStatus = t, i.errorThrown = n, u && u.call(i.context, e, t, n)
			};
			var l = i.xhr = t.ajax(n.extend(s, i));
			return r.trigger("request", r, l, i), l
		};
		var j = {
			create: "POST",
			update: "PUT",
			patch: "PATCH",
			delete: "DELETE",
			read: "GET"
		};
		t.ajax = function() {
			return t.$.ajax.apply(t.$, arguments)
		};
		var O = t.Router = function(e) {
				e || (e = {}), e.routes && (this.routes = e.routes), this._bindRoutes(), this.initialize.apply(this, arguments)
			},
			I = /\((.*?)\)/g,
			R = /(\(\?)?:\w+/g,
			N = /\*\w+/g,
			$ = /[\-{}\[\]+?.,\\\^$|#\s]/g;
		n.extend(O.prototype, c, {
			initialize: function() {},
			route: function(e, r, i) {
				n.isRegExp(e) || (e = this._routeToRegExp(e)), n.isFunction(r) && (i = r, r = ""), i || (i = this[r]);
				var o = this;
				return t.history.route(e, function(n) {
					var s = o._extractParameters(e, n);
					o.execute(i, s, r) !== !1 && (o.trigger.apply(o, ["route:" + r].concat(s)), o.trigger("route", r, s), t.history.trigger("route", o, r, s))
				}), this
			},
			execute: function(e, t, n) {
				e && e.apply(this, t)
			},
			navigate: function(e, n) {
				return t.history.navigate(e, n), this
			},
			_bindRoutes: function() {
				if (this.routes) {
					this.routes = n.result(this, "routes");
					for (var e, t = n.keys(this.routes); null != (e = t.pop());) this.route(e, this.routes[e])
				}
			},
			_routeToRegExp: function(e) {
				return e = e.replace($, "\\'{{MAIN_SCRIPT}}'").replace(I, "(?:$1)?").replace(R, function(e, t) {
					return t ? e : "([^/?]+)"
				}).replace(N, "([^?]*?)"), new RegExp("^" + e + "(?:\\?([\\s\\S]*))?$")
			},
			_extractParameters: function(e, t) {
				var r = e.exec(t).slice(1);
				return n.map(r, function(e, t) {
					return t === r.length - 1 ? e || null : e ? decodeURIComponent(e) : null
				})
			}
		});
		var D = t.History = function() {
				this.handlers = [], this.checkUrl = n.bind(this.checkUrl, this), "undefined" != typeof window && (this.location = window.location, this.history = window.history)
			},
			M = /^[#\/]|\s+$/g,
			L = /^\/+|\/+$/g,
			P = /#.*$/;
		D.started = !1, n.extend(D.prototype, c, {
			interval: 50,
			atRoot: function() {
				var e = this.location.pathname.replace(/[^\/]$/, "'{{MAIN_SCRIPT}}'/");
				return e === this.root && !this.getSearch()
			},
			matchRoot: function() {
				var e = this.decodeFragment(this.location.pathname),
					t = e.slice(0, this.root.length - 1) + "/";
				return t === this.root
			},
			decodeFragment: function(e) {
				return decodeURI(e.replace(/%25/g, "%2525"))
			},
			getSearch: function() {
				var e = this.location.href.replace(/#.*/, "").match(/\?.+/);
				return e ? e[0] : ""
			},
			getHash: function(e) {
				var t = (e || this).location.href.match(/#(.*)$/);
				return t ? t[1] : ""
			},
			getPath: function() {
				var e = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
				return "/" === e.charAt(0) ? e.slice(1) : e
			},
			getFragment: function(e) {
				return null == e && (e = this._usePushState || !this._wantsHashChange ? this.getPath() : this.getHash()), e.replace(M, "")
			},
			start: function(e) {
				if (D.started) throw new Error("Backbone.history has already been started");
				if (D.started = !0, this.options = n.extend({
						root: "/"
					}, this.options, e), this.root = this.options.root, this._wantsHashChange = this.options.hashChange !== !1, this._hasHashChange = "onhashchange" in window && (void 0 === document.documentMode || document.documentMode > 7), this._useHashChange = this._wantsHashChange && this._hasHashChange, this._wantsPushState = !!this.options.pushState, this._hasPushState = !(!this.history || !this.history.pushState), this._usePushState = this._wantsPushState && this._hasPushState, this.fragment = this.getFragment(), this.root = ("/" + this.root + "/").replace(L, "/"), this._wantsHashChange && this._wantsPushState) {
					if (!this._hasPushState && !this.atRoot()) {
						var t = this.root.slice(0, -1) || "/";
						return this.location.replace(t + "#" + this.getPath()), !0
					}
					this._hasPushState && this.atRoot() && this.navigate(this.getHash(), {
						replace: !0
					})
				}
				if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
					this.iframe = document.createElement("iframe"), this.iframe.src = "javascript:0", this.iframe.style.display = "none", this.iframe.tabIndex = -1;
					var r = document.body,
						i = r.insertBefore(this.iframe, r.firstChild).contentWindow;
					i.document.open(), i.document.close(), i.location.hash = "#" + this.fragment
				}
				var o = window.addEventListener || function(e, t) {
					return attachEvent("on" + e, t)
				};

				if (this._usePushState ? o("popstate", this.checkUrl, !1) : this._useHashChange
					&& !this.iframe ? o("hashchange", this.checkUrl, !1) : this._wantsHashChange
					&& (this._checkUrlInterval = setInterval(this.checkUrl, this.interval)), !this.options.silent)

					return this.loadUrl()
			},
			stop: function() {
				var e = window.removeEventListener || function(e, t) {
					return detachEvent("on" + e, t)
				};
				this._usePushState ? e("popstate", this.checkUrl, !1) : this._useHashChange && !this.iframe && e("hashchange", this.checkUrl, !1), this.iframe && (document.body.removeChild(this.iframe), this.iframe = null), this._checkUrlInterval && clearInterval(this._checkUrlInterval), D.started = !1
			},
			route: function(e, t) {
				this.handlers.unshift({
					route: e,
					callback: t
				})
			},
			checkUrl: function(e) {
				var t = this.getFragment();
				return t === this.fragment && this.iframe && (t = this.getHash(this.iframe.contentWindow)), t !== this.fragment && (this.iframe && this.navigate(t), void this.loadUrl())
			},
			loadUrl: function(e) {
				return !!this.matchRoot() && (e = this.fragment = this.getFragment(e), n.some(this.handlers, function(t) {
					if (t.route.test(e))
						return t.callback(e), !0
				}))
			},
			navigate: function(e, t) {
				if (!D.started) return !1;
				t && t !== !0 || (t = {
					trigger: !!t
				}), e = this.getFragment(e || "");
				var n = this.root;
				"" !== e && "?" !== e.charAt(0) || (n = n.slice(0, -1) || "/");
				var r = n + e;
				if (e = this.decodeFragment(e.replace(P, "")), this.fragment !== e) {
					if (this.fragment = e, this._usePushState) this.history[t.replace ? "replaceState" : "pushState"]({}, document.title, r);
					else {
						if (!this._wantsHashChange) return this.location.assign(r);
						if (this._updateHash(this.location, e, t.replace), this.iframe && e !== this.getHash(this.iframe.contentWindow)) {
							var i = this.iframe.contentWindow;
							t.replace || (i.document.open(), i.document.close()), this._updateHash(i.location, e, t.replace)
						}
					}
					return t.trigger ? this.loadUrl(e) : void 0
				}
			},
			_updateHash: function(e, t, n) {
				if (n) {
					var r = e.href.replace(/(javascript:|#).*$/, "");
					e.replace(r + "#" + t)
				} else e.hash = "#" + t
			}
		}), t.history = new D;
		var B = function(e, t) {
			var r, i = this;
			return r = e && n.has(e, "constructor") ? e.constructor : function() {
				return i.apply(this, arguments)
			}, n.extend(r, i, t), r.prototype = n.create(i.prototype, e), r.prototype.constructor = r, r.__super__ = i.prototype, r
		};
		b.extend = w.extend = O.extend = C.extend = D.extend = B;
		var q = function() {
				throw new Error('A "url" property or function must be specified')
			},
			F = function(e, t) {
				var n = t.error;
				t.error = function(r) {
					n && n.call(t.context, e, r, t), e.trigger("error", e, r, t)
				}
			};
		return t
	}), function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t(require("underscore"), require("backbone")) : "function" == typeof define && define.amd ? define("backbone.radio", ["underscore", "backbone"], t) : (e.Backbone = e.Backbone || {}, e.Backbone.Radio = t(e._, e.Backbone))
	}(this, function(e, t) {
		"use strict";

		function n(e, t, n, r) {
			var i = e[t];
			if (!(n && n !== i.callback && n !== i.callback._callback || r && r !== i.context)) return delete e[t], !0
		}

		function r(t, r, i, o) {
			t || (t = {});
			for (var s = r ? [r] : e.keys(t), a = !1, u = 0, l = s.length; u < l; u++) r = s[u], t[r] && n(t, r, i, o) && (a = !0);
			return a
		}

		function i(t) {
			return c[t] || (c[t] = e.bind(u.log, u, t))
		}

		function o(t) {
			return e.isFunction(t) ? t : function() {
				return t
			}
		}
		e = "default" in e ? e.default : e, t = "default" in t ? t.default : t;
		var s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
				return typeof e
			} : function(e) {
				return e && "function" == typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
			},
			a = t.Radio,
			u = t.Radio = {};
		u.VERSION = "2.0.0", u.noConflict = function() {
			return t.Radio = a, this
		}, u.DEBUG = !1, u._debugText = function(e, t, n) {
			return e + (n ? " on the " + n + " channel" : "") + ': "' + t + '"'
		}, u.debugLog = function(e, t, n) {
			u.DEBUG && console && console.warn && console.warn(u._debugText(e, t, n))
		};
		var l = /\s+/;
		u._eventsApi = function(t, n, r, i) {
			if (!r) return !1;
			var o = {};
			if ("object" === ("undefined" == typeof r ? "undefined" : s(r))) {
				for (var a in r) {
					var u = t[n].apply(t, [a, r[a]].concat(i));
					l.test(a) ? e.extend(o, u) : o[a] = u
				}
				return o
			}
			if (l.test(r)) {
				for (var c = r.split(l), p = 0, f = c.length; p < f; p++) o[c[p]] = t[n].apply(t, [c[p]].concat(i));
				return o
			}
			return !1
		}, u._callHandler = function(e, t, n) {
			var r = n[0],
				i = n[1],
				o = n[2];
			switch (n.length) {
				case 0:
					return e.call(t);
				case 1:
					return e.call(t, r);
				case 2:
					return e.call(t, r, i);
				case 3:
					return e.call(t, r, i, o);
				default:
					return e.apply(t, n)
			}
		};
		var c = {};
		e.extend(u, {
			log: function(t, n) {
				if ("undefined" != typeof console) {
					var r = e.toArray(arguments).slice(2);
					console.log("[" + t + '] "' + n + '"', r)
				}
			},
			tuneIn: function(e) {
				var t = u.channel(e);
				return t._tunedIn = !0, t.on("all", i(e)), this
			},
			tuneOut: function(e) {
				var t = u.channel(e);
				return t._tunedIn = !1, t.off("all", i(e)), delete c[e], this
			}
		}), u.Requests = {
			request: function(t) {
				var n = e.toArray(arguments).slice(1),
					r = u._eventsApi(this, "request", t, n);
				if (r) return r;
				var i = this.channelName,
					o = this._requests;
				if (i && this._tunedIn && u.log.apply(this, [i, t].concat(n)),
					o && (o[t] || o.default)) {
					var s = o[t] || o.default;
					return n = o[t] ? n : arguments, u._callHandler(s.callback, s.context, n)
				}
				u.debugLog("An unhandled request was fired", t, i)
			},
			reply: function(e, t, n) {
				return u._eventsApi(this, "reply", e, [t, n]) ? this : (this._requests || (this._requests = {}), this._requests[e] && u.debugLog("A request was overwritten", e, this.channelName), this._requests[e] = {
					callback: o(t),
					context: n || this
				}, this)
			},
			replyOnce: function(t, n, r) {
				if (u._eventsApi(this, "replyOnce", t, [n, r])) return this;
				var i = this,
					s = e.once(function() {
						return i.stopReplying(t), o(n).apply(this, arguments)
					});
				return this.reply(t, s, r)
			},
			stopReplying: function(e, t, n) {
				return u._eventsApi(this, "stopReplying", e) ? this : (e || t || n ? r(this._requests, e, t, n) || u.debugLog("Attempted to remove the unregistered request", e, this.channelName) : delete this._requests, this)
			}
		}, u._channels = {}, u.channel = function(e) {
			if (!e) throw new Error("You must provide a name for the channel.");
			return u._channels[e] ? u._channels[e] : u._channels[e] = new u.Channel(e)
		}, u.Channel = function(e) {
			this.channelName = e
		}, e.extend(u.Channel.prototype, t.Events, u.Requests, {
			reset: function() {
				return this.off(), this.stopListening(), this.stopReplying(), this
			}
		});
		var p, f, h = [t.Events, u.Requests];
		return e.each(h, function(t) {
			e.each(t, function(t, n) {
				u[n] = function(t) {
					return f = e.toArray(arguments).slice(1), p = this.channel(t), p[n].apply(p, f)
				}
			})
		}), u.reset = function(t) {
			var n = t ? [this._channels[t]] : this._channels;
			e.each(n, function(e) {
				e.reset()
			})
		}, u
	}), function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t(require("backbone"), require("underscore"), require("backbone.radio")) : "function" == typeof define && define.amd ? define("backbone.marionette", ["backbone", "underscore", "backbone.radio"], t) : e.Marionette = e.Mn = t(e.Backbone, e._, e.Backbone.Radio)
	}(this, function(e, t, n) {
		"use strict";

		function r(e, t, n) {
			return n.toUpperCase()
		}

		function i(e) {
			for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
			var o = W(e),
				s = U.call(this, o),
				a = void 0;
			return t.isFunction(s) && (a = s.apply(this, r)), this.trigger.apply(this, arguments), a
		}

		function o(e) {
			for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
			return t.isFunction(e.triggerMethod) ? e.triggerMethod.apply(e, r) : i.apply(e, r)
		}

		function s(e, n, r) {
			e._getImmediateChildren && t.each(e._getImmediateChildren(), function(e) {
				r(e) && o(e, n, e)
			})
		}

		function a(e) {
			return !e._isAttached
		}

		function u(e) {
			return !!a(e) && (e._isAttached = !0, !0)
		}

		function l(e) {
			return e._isAttached
		}

		function c(e) {
			return !!l(e) && (e._isAttached = !1, !0)
		}

		function p(e) {
			e._isAttached && e._isRendered && o(e, "dom:refresh", e)
		}

		function f() {
			s(this, "before:attach", a)
		}

		function h() {
			s(this, "attach", u), p(this)
		}

		function d() {
			s(this, "before:detach", l)
		}

		function g() {
			s(this, "detach", c)
		}

		function v() {
			p(this)
		}

		function y(e) {
			e._areViewEventsMonitored || (e._areViewEventsMonitored = !0, e.on({
				"before:attach": f,
				attach: h,
				"before:detach": d,
				detach: g,
				render: v
			}))
		}

		function m(e, n, r, i, o) {
			var s = i.split(/\s+/);
			t.each(s, function(t) {
				var i = e[t];
				if (!i) throw new J('Method "' + t + '" was configured as an event handler, but does not exist.');
				e[o](n, r, i)
			})
		}

		function b(e, n, r, i) {
			if (n && r) {
				if (!t.isObject(r)) throw new J({
					message: "Bindings must be an object.",
					url: "marionette.functions.html#marionettebindevents"
				});
				t.each(r, function(r, o) {
					return t.isString(r) ? void m(e, n, o, r, i) : void e[i](n, o, r)
				})
			}
		}

		function x(e, t) {
			return b(this, e, t, "listenTo"), this
		}

		function w(e, t) {
			return b(this, e, t, "stopListening"), this
		}

		function _(e, n, r, i) {
			if (n && r) {
				if (!t.isObject(r)) throw new J({
					message: "Bindings must be an object.",
					url: "marionette.functions.html#marionettebindrequests"
				});
				var o = z.call(e, r);
				n[i](o, e)
			}
		}

		function k(e, t) {
			return _(this, e, t, "reply"), this
		}

		function T(e, t) {
			return _(this, e, t, "stopReplying"), this
		}

		function E(e) {
			if (Array.isArray(e)) {
				for (var t = 0, n = Array(e.length); t < e.length; t++) n[t] = e[t];
				return n
			}
			return Array.from(e)
		}

		function C(e, n) {
			return e.behaviorClass ? e.behaviorClass : t.isFunction(e) ? e : t.isFunction($e.Behaviors.behaviorsLookup) ? $e.Behaviors.behaviorsLookup(e, n)[n] : $e.Behaviors.behaviorsLookup[n]
		}

		function A(e, n) {
			return t.chain(n).map(function(n, r) {
				var i = C(n, r),
					o = n === i ? {} : n,
					s = new i(o, e),
					a = A(e, t.result(s, "behaviors"));
				return [s].concat(a)
			}).flatten().value()
		}

		function S(e, n) {
			return [e + t.uniqueId(".evt"), n].join(" ")
		}

		function j(e, n) {
			t.isString(n) && (n = {
				event: n
			});
			var r = n.event,
				i = n.preventDefault !== !1,
				o = n.stopPropagation !== !1;
			return function(t) {
				i && t.preventDefault(), o && t.stopPropagation(), e.triggerMethod(r, e)
			}
		}

		function O(e) {
			e.supportsDestroyLifecycle || o(e, "before:destroy", e);
			var t = !!e._isAttached;
			t && o(e, "before:detach", e), e.remove(), t && (e._isAttached = !1, o(e, "detach", e)), e._isDestroyed = !0, e.supportsDestroyLifecycle || o(e, "destroy", e)
		}

		function I(e, t) {
			return e instanceof he ? e : R(e, t)
		}

		function R(e, n) {
			var r = t.extend({}, n);
			if (t.isString(e)) return t.extend(r, {
				el: e
			}), N(r);
			if (t.isFunction(e)) return t.extend(r, {
				regionClass: e
			}), N(r);
			if (t.isObject(e)) return e.selector && q("The selector option on a Region definition object is deprecated. Use el to pass a selector string"), t.extend(r, {
				el: e.selector
			}, e), N(r);
			throw new J({
				message: "Improper region configuration type.",
				url: "marionette.region.html#region-configuration-types"
			})
		}

		function N(e) {
			var n = e.regionClass,
				r = t.omit(e, "regionClass");
			return new n(r)
		}

		function $() {
			throw new J({
				message: "You must define where your behaviors are stored.",
				url: "marionette.behaviors.md#behaviorslookup"
			})
		}

		function D(e) {
			return !!Re[e]
		}

		function M(e, t) {
			return Re[e] = t
		}
		e = "default" in e ? e.default : e, t = "default" in t ? t.default : t, n = "default" in n ? n.default : n;
		var L = "3.1.0",
			P = function(e) {
				return function(t) {
					for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
					return e.apply(t, r)
				}
			},
			B = e.Model.extend,
			q = function e(n, r) {
				t.isObject(n) && (n = n.prev + " is going to be removed in the future. Please use " + n.next + " instead." + (n.url ? " See: " + n.url : "")), $e.DEV_MODE && (void 0 !== r && r || e._cache[n] || (e._warn("Deprecation warning: " + n), e._cache[n] = !0))
			};
		q._console = "undefined" != typeof console ? console : {}, q._warn = function() {
			var e = q._console.warn || q._console.log || t.noop;
			return e.apply(q._console, arguments)
		}, q._cache = {};
		var F = function(t) {
				return e.$.contains(document.documentElement, t)
			},
			V = function(e, n) {
				var r = this;
				e && t.each(n, function(t) {
					var n = e[t];
					void 0 !== n && (r[t] = n)
				})
			},
			U = function(e) {
				if (e) return this.options && void 0 !== this.options[e] ? this.options[e] : this[e]
			},
			z = function(e) {
				var n = this;
				return t.reduce(e, function(e, r, i) {
					return t.isFunction(r) || (r = n[r]), r && (e[i] = r), e
				}, {})
			},
			H = /(^|:)(\w)/gi,
			W = t.memoize(function(e) {
				return "on" + e.replace(H, r)
			}),
			G = ["description", "fileName", "lineNumber", "name", "message", "number"],
			J = B.call(Error, {
				urlRoot: "http://marionettejs.com/docs/v" + L + "/",
				constructor: function(e, n) {
					t.isObject(e) ? (n = e, e = n.message) : n || (n = {});
					var r = Error.call(this, e);
					t.extend(this, t.pick(r, G), t.pick(n, G)), this.captureStackTrace(), n.url && (this.url = this.urlRoot + n.url)
				},
				captureStackTrace: function() {
					Error.captureStackTrace && Error.captureStackTrace(this, J)
				},
				toString: function() {
					return this.name + ": " + this.message + (this.url ? " See: " + this.url : "")
				}
			});
		J.extend = B;
		var Z = function() {
				for (var e = arguments.length, n = Array(e), r = 0; r < e; r++) n[r] = arguments[r];
				this.options = t.extend.apply(t, [{}, t.result(this, "options")].concat(n))
			},
			Y = {
				normalizeMethods: z,
				_setOptions: Z,
				mergeOptions: V,
				getOption: U,
				bindEvents: x,
				unbindEvents: w
			},
			X = {
				_initRadio: function() {
					var e = t.result(this, "channelName");
					if (e) {
						if (!n) throw new J({
							name: "BackboneRadioMissing",
							message: 'The dependency "backbone.radio" is missing.'
						});
						var r = this._channel = n.channel(e),
							i = t.result(this, "radioEvents");
						this.bindEvents(r, i);
						var o = t.result(this, "radioRequests");
						this.bindRequests(r, o), this.on("destroy", this._destroyRadio)
					}
				},
				_destroyRadio: function() {
					this._channel.stopReplying(null, null, this)
				},
				getChannel: function() {
					return this._channel
				},
				bindEvents: x,
				unbindEvents: w,
				bindRequests: k,
				unbindRequests: T
			},
			K = ["channelName", "radioEvents", "radioRequests"],
			Q = function(e) {
				this._setOptions(e), this.mergeOptions(e, K), this.cid = t.uniqueId(this.cidPrefix), this._initRadio(), this.initialize.apply(this, arguments)
			};
		Q.extend = B, t.extend(Q.prototype, e.Events, Y, X, {
			cidPrefix: "mno",
			_isDestroyed: !1,
			isDestroyed: function() {
				return this._isDestroyed
			},
			initialize: function() {},
			destroy: function() {
				if (this._isDestroyed) return this;
				for (var e = arguments.length, t = Array(e), n = 0; n < e; n++) t[n] = arguments[n];
				return this.triggerMethod.apply(this, ["before:destroy", this].concat(t)), this._isDestroyed = !0, this.triggerMethod.apply(this, ["destroy", this].concat(t)), this.stopListening(), this
			},
			triggerMethod: i
		});
		var ee = function(e) {
			this.templateId = e
		};
		t.extend(ee, {
			templateCaches: {},
			get: function(e, t) {
				var n = this.templateCaches[e];
				return n || (n = new ee(e), this.templateCaches[e] = n), n.load(t)
			},
			clear: function() {
				for (var e = void 0, t = arguments.length, n = Array(t), r = 0; r < t; r++) n[r] = arguments[r];
				var i = n.length;
				if (i > 0)
					for (e = 0; e < i; e++) delete this.templateCaches[n[e]];
				else this.templateCaches = {}
			}
		}), t.extend(ee.prototype, {
			load: function(e) {
				if (this.compiledTemplate) return this.compiledTemplate;
				var t = this.loadTemplate(this.templateId, e);
				return this.compiledTemplate = this.compileTemplate(t, e), this.compiledTemplate
			},
			loadTemplate: function(t, n) {
				var r = e.$(t);
				if (!r.length) throw new J({
					name: "NoTemplateError",
					message: 'Could not find template: "' + t + '"'
				});
				return r.html()
			},
			compileTemplate: function(e, n) {
				return t.template(e, n)
			}
		});
		var te = t.invokeMap || t.invoke,
			ne = {
				_initBehaviors: function() {
					var e = t.result(this, "behaviors");
					this._behaviors = t.isObject(e) ? A(this, e) : {}
				},
				_getBehaviorTriggers: function() {
					var e = te(this._behaviors, "getTriggers");
					return t.extend.apply(t, [{}].concat(E(e)))
				},
				_getBehaviorEvents: function() {
					var e = te(this._behaviors, "getEvents");
					return t.extend.apply(t, [{}].concat(E(e)))
				},
				_proxyBehaviorViewProperties: function() {
					te(this._behaviors, "proxyViewProperties")
				},
				_delegateBehaviorEntityEvents: function() {
					te(this._behaviors, "delegateEntityEvents")
				},
				_undelegateBehaviorEntityEvents: function() {
					te(this._behaviors, "undelegateEntityEvents")
				},
				_destroyBehaviors: function(e) {
					te.apply(void 0, [this._behaviors, "destroy"].concat(E(e)))
				},
				_bindBehaviorUIElements: function() {
					te(this._behaviors, "bindUIElements")
				},
				_unbindBehaviorUIElements: function() {
					te(this._behaviors, "unbindUIElements")
				},
				_triggerEventOnBehaviors: function() {
					for (var e = this._behaviors, t = 0, n = e && e.length; t < n; t++) i.apply(e[t], arguments)
				}
			},
			re = {
				_delegateEntityEvents: function(e, n) {
					this._undelegateEntityEvents(e, n);
					var r = t.result(this, "modelEvents");
					x.call(this, e, r);
					var i = t.result(this, "collectionEvents");
					x.call(this, n, i)
				},
				_undelegateEntityEvents: function(e, n) {
					var r = t.result(this, "modelEvents");
					w.call(this, e, r);
					var i = t.result(this, "collectionEvents");
					w.call(this, n, i)
				}
			},
			ie = /^(\S+)\s*(.*)$/,
			oe = function(e) {
				var t = e.match(ie);
				return S(t[1], t[2])
			},
			se = {
				_getViewTriggers: function(e, n) {
					return t.reduce(n, function(t, n, r) {
						return r = oe(r), t[r] = j(e, n), t
					}, {})
				}
			},
			ae = function(e, n) {
				return t.reduce(e, function(e, t, r) {
					var i = ue(r, n);
					return e[i] = t, e
				}, {})
			},
			ue = function(e, t) {
				return e.replace(/@ui\.[a-zA-Z-_$0-9]*/g, function(e) {
					return t[e.slice(4)]
				})
			},
			le = function e(n, r, i) {
				return t.each(n, function(o, s) {
					t.isString(o) ? n[s] = ue(o, r) : t.isObject(o) && t.isArray(i) && (t.extend(o, e(t.pick(o, i), r)), t.each(i, function(e) {
						var n = o[e];
						t.isString(n) && (o[e] = ue(n, r))
					}))
				}), n
			},
			ce = {
				normalizeUIKeys: function(e) {
					var t = this._getUIBindings();
					return ae(e, t)
				},
				normalizeUIString: function(e) {
					var t = this._getUIBindings();
					return ue(e, t)
				},
				normalizeUIValues: function(e, t) {
					var n = this._getUIBindings();
					return le(e, n, t)
				},
				_getUIBindings: function() {
					var e = t.result(this, "_uiBindings"),
						n = t.result(this, "ui");
					return e || n
				},
				_bindUIElements: function() {
					var e = this;
					if (this.ui) {
						this._uiBindings || (this._uiBindings = this.ui);
						var n = t.result(this, "_uiBindings");
						this._ui = {}, t.each(n, function(t, n) {
							e._ui[n] = e.$(t)
						}), this.ui = this._ui
					}
				},
				_unbindUIElements: function() {
					var e = this;
					this.ui && this._uiBindings && (t.each(this.ui, function(t, n) {
						delete e.ui[n]
					}), this.ui = this._uiBindings, delete this._uiBindings, delete this._ui)
				},
				_getUI: function(e) {
					return this._ui[e]
				}
			},
			pe = {
				supportsRenderLifecycle: !0,
				supportsDestroyLifecycle: !0,
				_isDestroyed: !1,
				isDestroyed: function() {
					return !!this._isDestroyed
				},
				_isRendered: !1,
				isRendered: function() {
					return !!this._isRendered
				},
				_isAttached: !1,
				isAttached: function() {
					return !!this._isAttached
				},
				delegateEvents: function(n) {
					this._proxyBehaviorViewProperties(), this._buildEventProxies();
					var r = this._getEvents(n);
					"undefined" == typeof n && (this.events = r);
					var i = t.extend({}, this._getBehaviorEvents(), r, this._getBehaviorTriggers(), this.getTriggers());
					return e.View.prototype.delegateEvents.call(this, i), this
				},
				_getEvents: function(e) {
					var n = e || this.events;
					return t.isFunction(n) ? this.normalizeUIKeys(n.call(this)) : this.normalizeUIKeys(n)
				},
				getTriggers: function() {
					if (this.triggers) {
						var e = this.normalizeUIKeys(t.result(this, "triggers"));
						return this._getViewTriggers(this, e)
					}
				},
				delegateEntityEvents: function() {
					return this._delegateEntityEvents(this.model, this.collection), this._delegateBehaviorEntityEvents(), this
				},
				undelegateEntityEvents: function() {
					return this._undelegateEntityEvents(this.model, this.collection), this._undelegateBehaviorEntityEvents(), this
				},
				_ensureViewIsIntact: function() {
					if (this._isDestroyed) throw new J({
						name: "ViewDestroyedError",
						message: 'View (cid: "' + this.cid + '") has already been destroyed and cannot be used.'
					})
				},
				destroy: function() {
					if (this._isDestroyed) return this;
					for (var e = !!this._isAttached, t = arguments.length, n = Array(t), r = 0; r < t; r++) n[r] = arguments[r];
					return this.triggerMethod.apply(this, ["before:destroy", this].concat(n)), e && this.triggerMethod("before:detach", this), this.unbindUIElements(), this._removeElement(), e && (this._isAttached = !1, this.triggerMethod("detach", this)), this._removeChildren(), this._destroyBehaviors(n), this._isDestroyed = !0, this._isRendered = !1, this.triggerMethod.apply(this, ["destroy", this].concat(n)), this.stopListening(), this
				},
				bindUIElements: function() {
					return this._bindUIElements(), this._bindBehaviorUIElements(), this
				},
				unbindUIElements: function() {
					return this._unbindUIElements(), this._unbindBehaviorUIElements(), this
				},
				getUI: function(e) {
					return this._ensureViewIsIntact(), this._getUI(e)
				},
				childViewEventPrefix: "childview",
				triggerMethod: function() {
					var e = i.apply(this, arguments);
					return this._triggerEventOnBehaviors.apply(this, arguments), this._triggerEventOnParentLayout.apply(this, arguments), e
				},
				_buildEventProxies: function() {
					this._childViewEvents = t.result(this, "childViewEvents"), this._childViewTriggers = t.result(this, "childViewTriggers")
				},
				_triggerEventOnParentLayout: function() {
					var e = this._parentView();
					e && e._childViewEventHandler.apply(e, arguments)
				},
				_parentView: function() {
					for (var e = this._parent; e;) {
						if (e instanceof ye) return e;
						e = e._parent
					}
				},
				_childViewEventHandler: function(e) {
					for (var n = this.normalizeMethods(this._childViewEvents), r = arguments.length, i = Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++) i[o - 1] = arguments[o];
					"undefined" != typeof n && t.isFunction(n[e]) && n[e].apply(this, i);
					var s = this._childViewTriggers;
					s && t.isString(s[e]) && this.triggerMethod.apply(this, [s[e]].concat(i));
					var a = t.result(this, "childViewEventPrefix");
					if (a !== !1) {
						var u = a + ":" + e;
						this.triggerMethod.apply(this, [u].concat(i))
					}
				}
			};
		t.extend(pe, ne, Y, re, se, ce);
		var fe = ["allowMissingEl", "parentEl", "replaceElement"],
			he = Q.extend({
				cidPrefix: "mnr",
				replaceElement: !1,
				_isReplaced: !1,
				constructor: function(t) {
					if (this._setOptions(t), this.mergeOptions(t, fe), this._initEl = this.el = this.getOption("el"), this.el = this.el instanceof e.$ ? this.el[0] : this.el, !this.el) throw new J({
						name: "NoElError",
						message: 'An "el" must be specified for a region.'
					});
					this.$el = this.getEl(this.el), Q.call(this, t)
				},
				show: function(e, t) {
					if (this._ensureElement(t)) return this._ensureView(e), e === this.currentView ? this : (this.triggerMethod("before:show", this, e, t), y(e), this.empty(t), e.on("destroy", this._empty, this), e._parent = this, this._renderView(e), this._attachView(e, t), this.triggerMethod("show", this, e, t), this)
				},
				_renderView: function(e) {
					e._isRendered || (e.supportsRenderLifecycle || o(e, "before:render", e), e.render(), e.supportsRenderLifecycle || (e._isRendered = !0, o(e, "render", e)))
				},
				_attachView: function(e) {
					var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
						r = !e._isAttached && F(this.el),
						i = "undefined" == typeof n.replaceElement ? !!t.result(this, "replaceElement") : !!n.replaceElement;
					r && o(e, "before:attach", e), i ? this._replaceEl(e) : this.attachHtml(e), r && (e._isAttached = !0, o(e, "attach", e)), this.currentView = e
				},
				_ensureElement: function() {
					var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
					if (t.isObject(this.el) || (this.$el = this.getEl(this.el), this.el = this.$el[0]), !this.$el || 0 === this.$el.length) {
						var n = "undefined" == typeof e.allowMissingEl ? !!t.result(this, "allowMissingEl") : !!e.allowMissingEl;
						if (n) return !1;
						throw new J('An "el" must exist in DOM for this region ' + this.cid)
					}
					return !0
				},
				_ensureView: function(e) {
					if (!e) throw new J({
						name: "ViewNotValid",
						message: "The view passed is undefined and therefore invalid. You must pass a view instance to show."
					});
					if (e._isDestroyed) throw new J({
						name: "ViewDestroyedError",
						message: 'View (cid: "' + e.cid + '") has already been destroyed and cannot be used.'
					})
				},
				getEl: function(n) {
					return e.$(n, t.result(this, "parentEl"))
				},
				_replaceEl: function(e) {
					this._restoreEl();
					var t = this.el.parentNode;
					t.replaceChild(e.el, this.el), this._isReplaced = !0
				},
				_restoreEl: function() {
					if (this._isReplaced) {
						var e = this.currentView;
						if (e) {
							var t = e.el.parentNode;
							t && (t.replaceChild(this.el, e.el), this._isReplaced = !1)
						}
					}
				},
				isReplaced: function() {
					return !!this._isReplaced
				},
				attachHtml: function(e) {
					this.el.appendChild(e.el)
				},
				empty: function() {
					var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {
							allowMissingEl: !0
						},
						t = this.currentView;
					if (!t) return this._ensureElement(e) && this.detachHtml(), this;
					var n = !e.preventDestroy;
					return n || q("The preventDestroy option is deprecated. Use Region#detachView"), this._empty(t, n), this
				},
				_empty: function(e, t) {
					e.off("destroy", this._empty, this), this.triggerMethod("before:empty", this, e), this._restoreEl(), delete this.currentView, e._isDestroyed || (this._removeView(e, t), delete e._parent), this.triggerMethod("empty", this, e)
				},
				_removeView: function(e, t) {
					return t ? void(e.destroy ? e.destroy() : O(e)) : void this._detachView(e)
				},
				detachView: function() {
					var e = this.currentView;
					if (e) return this._empty(e), e
				},
				_detachView: function(e) {
					var t = !!e._isAttached;
					t && o(e, "before:detach", e), this.detachHtml(), t && (e._isAttached = !1, o(e, "detach", e))
				},
				detachHtml: function() {
					this.$el.contents().detach()
				},
				hasView: function() {
					return !!this.currentView
				},
				reset: function(e) {
					return this.empty(e), this.$el && (this.el = this._initEl), delete this.$el, this
				},
				destroy: function(e) {
					return this.reset(e), Q.prototype.destroy.apply(this, arguments)
				}
			}),
			de = {
				regionClass: he,
				_initRegions: function() {
					this.regions = this.regions || {}, this._regions = {}, this.addRegions(t.result(this, "regions"))
				},
				_reInitRegions: function() {
					te(this._regions, "reset")
				},
				addRegion: function(e, t) {
					var n = {};
					return n[e] = t, this.addRegions(n)[e]
				},
				addRegions: function(e) {
					if (!t.isEmpty(e)) return e = this.normalizeUIValues(e, ["selector", "el"]), this.regions = t.extend({}, this.regions, e), this._addRegions(e)
				},
				_addRegions: function(e) {
					var n = this,
						r = {
							regionClass: this.regionClass,
							parentEl: t.partial(t.result, this, "el")
						};
					return t.reduce(e, function(e, t, i) {
						return e[i] = I(t, r), n._addRegion(e[i], i), e
					}, {})
				},
				_addRegion: function(e, t) {
					this.triggerMethod("before:add:region", this, t, e), e._parent = this, this._regions[t] = e, this.triggerMethod("add:region", this, t, e)
				},
				removeRegion: function(e) {
					var t = this._regions[e];
					return this._removeRegion(t, e), t
				},
				removeRegions: function() {
					var e = this.getRegions();
					return t.each(this._regions, t.bind(this._removeRegion, this)), e
				},
				_removeRegion: function(e, t) {
					this.triggerMethod("before:remove:region", this, t, e), e.destroy(), delete this.regions[t], delete this._regions[t], this.triggerMethod("remove:region", this, t, e)
				},
				emptyRegions: function() {
					var e = this.getRegions();
					return te(e, "empty"), e
				},
				hasRegion: function(e) {
					return !!this.getRegion(e)
				},
				getRegion: function(e) {
					return this._regions[e]
				},
				getRegions: function() {
					return t.clone(this._regions)
				},
				showChildView: function(e, t) {
					for (var n = this.getRegion(e), r = arguments.length, i = Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++) i[o - 2] = arguments[o];
					return n.show.apply(n, [t].concat(i))
				},
				detachChildView: function(e) {
					return this.getRegion(e).detachView()
				},
				getChildView: function(e) {
					return this.getRegion(e).currentView
				}
			},
			ge = {
				render: function(e, n) {
					if (!e) throw new J({
						name: "TemplateNotFoundError",
						message: "Cannot render the template since its false, null or undefined."
					});
					var r = t.isFunction(e) ? e : ee.get(e);
					return r(n)
				}
			},
			ve = ["behaviors", "childViewEventPrefix", "childViewEvents", "childViewTriggers", "collectionEvents", "events", "modelEvents", "regionClass", "regions", "template", "templateContext", "triggers", "ui"],
			ye = e.View.extend({
				constructor: function(n) {
					this.render = t.bind(this.render, this), this._setOptions(n), this.mergeOptions(n, ve), y(this), this._initBehaviors(), this._initRegions();
					var r = Array.prototype.slice.call(arguments);
					r[0] = this.options, e.View.prototype.constructor.apply(this, r), this.delegateEntityEvents()
				},
				serializeData: function() {
					return this.model || this.collection ? this.model ? this.serializeModel() : {
						items: this.serializeCollection()
					} : {}
				},
				serializeModel: function() {
					return this.model ? t.clone(this.model.attributes) : {}
				},
				serializeCollection: function() {
					return this.collection ? this.collection.map(function(e) {
						return t.clone(e.attributes)
					}) : {}
				},
				setElement: function() {
					var t = !!this.el;
					return e.View.prototype.setElement.apply(this, arguments), t && (this._isRendered = !!this.$el.length, this._isAttached = F(this.el)), this._isRendered && this.bindUIElements(), this
				},
				render: function() {
					return this._ensureViewIsIntact(), this.triggerMethod("before:render", this), this._isRendered && this._reInitRegions(), this._renderTemplate(), this.bindUIElements(), this._isRendered = !0, this.triggerMethod("render", this), this
				},
				_renderTemplate: function() {
					var e = this.getTemplate();
					if (e !== !1) {
						var t = this.mixinTemplateContext(this.serializeData()),
							n = ge.render(e, t, this);
						this.attachElContent(n)
					}
				},
				getTemplate: function() {
					return this.template
				},
				mixinTemplateContext: function() {
					var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
						n = t.result(this, "templateContext");
					return t.extend(e, n)
				},
				attachElContent: function(e) {
					return this.$el.html(e), this
				},
				_removeChildren: function() {
					this.removeRegions()
				},
				_getImmediateChildren: function() {
					return t.chain(this.getRegions()).map("currentView").compact().value()
				}
			});
		t.extend(ye.prototype, pe, de);
		var me = ["forEach", "each", "map", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "toArray", "first", "initial", "rest", "last", "without", "isEmpty", "pluck", "reduce"],
			be = function(e, n) {
				t.each(me, function(r) {
					e[r] = function() {
						var e = t.values(t.result(this, n)),
							i = [e].concat(t.toArray(arguments));
						return t[r].apply(t, i)
					}
				})
			},
			xe = function(e) {
				this._views = {}, this._indexByModel = {}, this._indexByCustom = {}, this._updateLength(), t.each(e, t.bind(this.add, this))
			};
		be(xe.prototype, "_views"), t.extend(xe.prototype, {
			add: function(e, t) {
				return this._add(e, t)._updateLength()
			},
			_add: function(e, t) {
				var n = e.cid;
				return this._views[n] = e, e.model && (this._indexByModel[e.model.cid] = n), t && (this._indexByCustom[t] = n), this
			},
			findByModel: function(e) {
				return this.findByModelCid(e.cid)
			},
			findByModelCid: function(e) {
				var t = this._indexByModel[e];
				return this.findByCid(t)
			},
			findByCustom: function(e) {
				var t = this._indexByCustom[e];
				return this.findByCid(t)
			},
			findByIndex: function(e) {
				return t.values(this._views)[e]
			},
			findByCid: function(e) {
				return this._views[e]
			},
			remove: function(e) {
				return this._remove(e)._updateLength()
			},
			_remove: function(e) {
				var n = e.cid;
				return e.model && delete this._indexByModel[e.model.cid], t.some(this._indexByCustom, t.bind(function(e, t) {
					if (e === n) return delete this._indexByCustom[t], !0
				}, this)), delete this._views[n], this
			},
			_updateLength: function() {
				return this.length = t.size(this._views), this
			}
		});
		var we = ["behaviors", "childView", "childViewEventPrefix", "childViewEvents", "childViewOptions", "childViewTriggers", "collectionEvents", "events", "filter", "emptyView", "emptyViewOptions", "modelEvents", "reorderOnSort", "sort", "triggers", "ui", "viewComparator"],
			_e = e.View.extend({
				sort: !0,
				constructor: function(n) {
					this.render = t.bind(this.render, this), this._setOptions(n), this.mergeOptions(n, we), y(this), this._initBehaviors(), this.once("render", this._initialEvents), this._initChildViewStorage(), this._bufferedChildren = [];
					var r = Array.prototype.slice.call(arguments);
					r[0] = this.options, e.View.prototype.constructor.apply(this, r), this.delegateEntityEvents()
				},
				_startBuffering: function() {
					this._isBuffering = !0
				},
				_endBuffering: function() {
					var e = !!this._isAttached,
						n = e ? this._getImmediateChildren() : [];
					this._isBuffering = !1, t.each(n, function(e) {
						o(e, "before:attach", e)
					}), this.attachBuffer(this, this._createBuffer()), t.each(n, function(e) {
						e._isAttached = !0, o(e, "attach", e)
					}), this._bufferedChildren = []
				},
				_getImmediateChildren: function() {
					return t.values(this.children._views)
				},
				_initialEvents: function() {
					this.collection && (this.listenTo(this.collection, "add", this._onCollectionAdd), this.listenTo(this.collection, "update", this._onCollectionUpdate), this.listenTo(this.collection, "reset", this.render), this.sort && this.listenTo(this.collection, "sort", this._sortViews))
				},
				_onCollectionAdd: function(e, n, r) {
					var i = void 0 !== r.at && (r.index || n.indexOf(e));
					(this.filter || i === !1) && (i = t.indexOf(this._filteredSortedModels(i), e)), this._shouldAddChild(e, i) && (this._destroyEmptyView(), this._addChild(e, i))
				},
				_onCollectionUpdate: function(e, t) {
					var n = t.changes;
					this._removeChildModels(n.removed)
				},
				_removeChildModels: function(e) {
					var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
						n = t.checkEmpty,
						r = n !== !1,
						i = this._getRemovedViews(e);
					i.length && (this.children._updateLength(), this._updateIndices(i, !1), r && this._checkEmpty())
				},
				_getRemovedViews: function(e) {
					var n = this;
					return t.reduce(e, function(e, t) {
						var r = n.children.findByModel(t);
						return !r || r._isDestroyed ? e : (n._removeChildView(r), e.push(r), e)
					}, [])
				},
				_findGreatestIndexedView: function(e) {
					return t.reduce(e, function(e, t) {
						return !e || e._index < t._index ? t : e
					}, void 0)
				},
				_removeChildView: function(e) {
					this.triggerMethod("before:remove:child", this, e), this.children._remove(e), e.destroy ? e.destroy() : O(e), delete e._parent, this.stopListening(e), this.triggerMethod("remove:child", this, e)
				},
				setElement: function() {
					var t = !!this.el;
					return e.View.prototype.setElement.apply(this, arguments), t && (this._isAttached = F(this.el)), this
				},
				render: function() {
					return this._ensureViewIsIntact(), this.triggerMethod("before:render", this), this._renderChildren(), this._isRendered = !0, this.triggerMethod("render", this), this
				},
				setFilter: function(e) {
					var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
						n = t.preventRender,
						r = this._isRendered && !this._isDestroyed,
						i = this.filter !== e,
						o = r && i && !n;
					if (o) {
						var s = this._filteredSortedModels();
						this.filter = e;
						var a = this._filteredSortedModels();
						this._applyModelDeltas(a, s)
					} else this.filter = e;
					return this
				},
				removeFilter: function(e) {
					return this.setFilter(null, e)
				},
				_applyModelDeltas: function(e, n) {
					var r = this,
						i = {};
					t.each(e, function(e, t) {
						var n = !r.children.findByModel(e);
						n && r._onCollectionAdd(e, r.collection, {
							at: t
						}), i[e.cid] = !0
					});
					var o = t.filter(n, function(e) {
						return !i[e.cid] && r.children.findByModel(e)
					});
					this._removeChildModels(o)
				},
				reorder: function() {
					var e = this,
						n = this.children,
						r = this._filteredSortedModels();
					if (!r.length && this._showingEmptyView) return this;
					var i = t.some(r, function(e) {
						return !n.findByModel(e)
					});
					return i ? this.render() : ! function() {
						var i = [],
							o = n.reduce(function(e, n) {
								var o = t.indexOf(r, n.model);
								return o === -1 ? (i.push(n.model), e) : (n._index = o, e[o] = n.el, e)
							}, new Array(r.length));
						e.triggerMethod("before:reorder", e), e._appendReorderedChildren(o), e._removeChildModels(i), e.triggerMethod("reorder", e)
					}(), this
				},
				resortView: function() {
					return this.reorderOnSort ? this.reorder() : this._renderChildren(), this
				},
				_sortViews: function() {
					var e = this,
						n = this._filteredSortedModels(),
						r = t.find(n, function(t, n) {
							var r = e.children.findByModel(t);
							return !r || r._index !== n
						});
					r && this.resortView()
				},
				_emptyViewIndex: -1,
				_appendReorderedChildren: function(e) {
					this.$el.append(e)
				},
				_renderChildren: function() {
					this._isRendered && (this._destroyEmptyView(), this._destroyChildren({
						checkEmpty: !1
					}));
					var e = this._filteredSortedModels();
					this.isEmpty({
						processedModels: e
					}) ? this._showEmptyView() : (this.triggerMethod("before:render:children", this), this._startBuffering(), this._showCollection(e), this._endBuffering(), this.triggerMethod("render:children", this))
				},
				_createView: function(e, t) {
					var n = this._getChildView(e),
						r = this._getChildViewOptions(e, t),
						i = this.buildChildView(e, n, r);
					return i
				},
				_setupChildView: function(e, t) {
					e._parent = this, y(e), this._proxyChildEvents(e), this.sort && (e._index = t)
				},
				_showCollection: function(e) {
					t.each(e, t.bind(this._addChild, this)), this.children._updateLength()
				},
				_filteredSortedModels: function(e) {
					if (!this.collection || !this.collection.length) return [];
					var t = this.getViewComparator(),
						n = this.collection.models;
					if (e = Math.min(Math.max(e, 0), n.length - 1), t) {
						var r = void 0;
						e && (r = n[e], n = n.slice(0, e).concat(n.slice(e + 1))), n = this._sortModelsBy(n, t), r && n.splice(e, 0, r)
					}
					return n = this._filterModels(n)
				},
				getViewComparator: function() {
					return this.viewComparator
				},
				_filterModels: function(e) {
					var n = this;
					return this.filter && (e = t.filter(e, function(e, t) {
						return n._shouldAddChild(e, t)
					})), e
				},
				_sortModelsBy: function(e, n) {
					return "string" == typeof n ? t.sortBy(e, function(e) {
						return e.get(n)
					}) : 1 === n.length ? t.sortBy(e, t.bind(n, this)) : e.sort(t.bind(n, this))
				},
				_showEmptyView: function() {
					var n = this._getEmptyView();
					if (n && !this._showingEmptyView) {
						this._showingEmptyView = !0;
						var r = new e.Model,
							i = this.emptyViewOptions || this.childViewOptions;
						t.isFunction(i) && (i = i.call(this, r, this._emptyViewIndex));
						var o = this.buildChildView(r, n, i);
						this.triggerMethod("before:render:empty", this, o), this.addChildView(o, 0), this.triggerMethod("render:empty", this, o)
					}
				},
				_destroyEmptyView: function() {
					this._showingEmptyView && (this.triggerMethod("before:remove:empty", this), this._destroyChildren(), delete this._showingEmptyView, this.triggerMethod("remove:empty", this))
				},
				_getEmptyView: function() {
					var e = this.emptyView;
					if (e) return this._getView(e)
				},
				_getChildView: function(e) {
					var t = this.childView;
					if (!t) throw new J({
						name: "NoChildViewError",
						message: 'A "childView" must be specified'
					});
					if (t = this._getView(t, e), !t) throw new J({
						name: "InvalidChildViewError",
						message: '"childView" must be a view class or a function that returns a view class'
					});
					return t
				},
				_getView: function(n, r) {
					return n.prototype instanceof e.View || n === e.View ? n : t.isFunction(n) ? n.call(this, r) : void 0
				},
				_addChild: function(e, t) {
					var n = this._createView(e, t);
					return this.addChildView(n, t), n
				},
				_getChildViewOptions: function(e, n) {
					return t.isFunction(this.childViewOptions) ? this.childViewOptions(e, n) : this.childViewOptions
				},
				addChildView: function(e, t) {
					return this.triggerMethod("before:add:child", this, e), this._setupChildView(e, t), this._isBuffering ? this.children._add(e) : (this._updateIndices(e, !0), this.children.add(e)), this._renderView(e), this._attachView(e, t), this.triggerMethod("add:child", this, e), e
				},
				_updateIndices: function(e, n) {
					if (this.sort) {
						var r = t.isArray(e) ? this._findGreatestIndexedView(e) : e;
						this.children.each(function(e) {
							e._index >= r._index && (e._index += n ? 1 : -1)
						})
					}
				},
				_renderView: function(e) {
					e._isRendered || (e.supportsRenderLifecycle || o(e, "before:render", e), e.render(), e.supportsRenderLifecycle || (e._isRendered = !0, o(e, "render", e)))
				},
				_attachView: function(e, t) {
					var n = !e._isAttached && !this._isBuffering && this._isAttached;
					n && o(e, "before:attach", e), this.attachHtml(this, e, t), n && (e._isAttached = !0, o(e, "attach", e))
				},
				buildChildView: function(e, n, r) {
					var i = t.extend({
						model: e
					}, r);
					return new n(i)
				},
				removeChildView: function(e) {
					return !e || e._isDestroyed ? e : (this._removeChildView(e), this.children._updateLength(), this._updateIndices(e, !1), e)
				},
				isEmpty: function(e) {
					var n = void 0;
					return t.result(e, "processedModels") ? n = e.processedModels : (n = this.collection ? this.collection.models : [], n = this._filterModels(n)), 0 === n.length
				},
				_checkEmpty: function() {
					this.isEmpty() && this._showEmptyView()
				},
				attachBuffer: function(e, t) {
					e.$el.append(t)
				},
				_createBuffer: function() {
					var e = document.createDocumentFragment();
					return t.each(this._bufferedChildren, function(t) {
						e.appendChild(t.el)
					}), e
				},
				attachHtml: function(e, t, n) {
					e._isBuffering ? e._bufferedChildren.splice(n, 0, t) : e._insertBefore(t, n) || e._insertAfter(t)
				},
				_insertBefore: function(e, t) {
					var n = void 0,
						r = this.sort && t < this.children.length - 1;
					return r && (n = this.children.find(function(e) {
						return e._index === t + 1
					})), !!n && (n.$el.before(e.el), !0)
				},
				_insertAfter: function(e) {
					this.$el.append(e.el);
				},
				_initChildViewStorage: function() {
					this.children = new xe
				},
				_removeChildren: function() {
					this._destroyChildren({
						checkEmpty: !1
					})
				},
				_destroyChildren: function(e) {
					if (this.children.length) {
						this.triggerMethod("before:destroy:children", this);
						var t = this.children.map("model");
						this._removeChildModels(t, e), this.triggerMethod("destroy:children", this)
					}
				},
				_shouldAddChild: function(e, n) {
					var r = this.filter;
					return !t.isFunction(r) || r.call(this, e, n, this.collection)
				},
				_proxyChildEvents: function(e) {
					this.listenTo(e, "all", this._childViewEventHandler)
				}
			});
		t.extend(_e.prototype, pe);
		var ke = ["childViewContainer", "template", "templateContext"],
			Te = _e.extend({
				constructor: function(e) {
					q("CompositeView is deprecated. Convert to View at your earliest convenience"), this.mergeOptions(e, ke), _e.prototype.constructor.apply(this, arguments)
				},
				_initialEvents: function() {
					this.collection && (this.listenTo(this.collection, "add", this._onCollectionAdd), this.listenTo(this.collection, "update", this._onCollectionUpdate), this.listenTo(this.collection, "reset", this.renderChildren), this.sort && this.listenTo(this.collection, "sort", this._sortViews))
				},
				_getChildView: function(e) {
					var t = this.childView;
					if (!t) return this.constructor;
					if (t = this._getView(t, e), !t) throw new J({
						name: "InvalidChildViewError",
						message: '"childView" must be a view class or a function that returns a view class'
					});
					return t
				},
				serializeData: function() {
					return this.serializeModel()
				},
				render: function() {
					return this._ensureViewIsIntact(), this._isRendering = !0, this.resetChildViewContainer(), this.triggerMethod("before:render", this), this._renderTemplate(), this.bindUIElements(), this.renderChildren(), this._isRendering = !1, this._isRendered = !0, this.triggerMethod("render", this), this
				},
				renderChildren: function() {
					(this._isRendered || this._isRendering) && _e.prototype._renderChildren.call(this)
				},
				attachBuffer: function(e, t) {
					var n = this.getChildViewContainer(e);
					n.append(t)
				},
				_insertAfter: function(e) {
					var t = this.getChildViewContainer(this, e);
					t.append(e.el)
				},
				_appendReorderedChildren: function(e) {
					var t = this.getChildViewContainer(this);
					t.append(e)
				},
				getChildViewContainer: function(e, n) {
					if (e.$childViewContainer) return e.$childViewContainer;
					var r = void 0,
						i = e.childViewContainer;
					if (i) {
						var o = t.result(e, "childViewContainer");
						if (r = "@" === o.charAt(0) && e.ui ? e.ui[o.substr(4)] : e.$(o), r.length <= 0) throw new J({
							name: "ChildViewContainerMissingError",
							message: 'The specified "childViewContainer" was not found: ' + e.childViewContainer
						})
					} else r = e.$el;
					return e.$childViewContainer = r, r
				},
				resetChildViewContainer: function() {
					this.$childViewContainer && (this.$childViewContainer = void 0)
				}
			}),
			Ee = t.pick(ye.prototype, "serializeModel", "getTemplate", "_renderTemplate", "mixinTemplateContext", "attachElContent");
		t.extend(Te.prototype, Ee);
		var Ce = ["collectionEvents", "events", "modelEvents", "triggers", "ui"],
			Ae = Q.extend({
				cidPrefix: "mnb",
				constructor: function(e, n) {
					this.view = n, this.defaults = t.clone(t.result(this, "defaults", {})), this._setOptions(this.defaults, e), this.mergeOptions(this.options, Ce), this.ui = t.extend({}, t.result(this, "ui"), t.result(n, "ui")), Q.apply(this, arguments)
				},
				$: function() {
					return this.view.$.apply(this.view, arguments)
				},
				destroy: function() {
					return this.stopListening(), this
				},
				proxyViewProperties: function() {
					return this.$el = this.view.$el, this.el = this.view.el, this
				},
				bindUIElements: function() {
					return this._bindUIElements(), this
				},
				unbindUIElements: function() {
					return this._unbindUIElements(), this
				},
				getUI: function(e) {
					return this.view._ensureViewIsIntact(), this._getUI(e)
				},
				delegateEntityEvents: function() {
					return this._delegateEntityEvents(this.view.model, this.view.collection), this
				},
				undelegateEntityEvents: function() {
					return this._undelegateEntityEvents(this.view.model, this.view.collection), this
				},
				getEvents: function() {
					var e = this,
						n = this.normalizeUIKeys(t.result(this, "events"));
					return t.reduce(n, function(n, r, i) {
						if (t.isFunction(r) || (r = e[r]), r) return i = oe(i), n[i] = t.bind(r, e), n
					}, {})
				},
				getTriggers: function() {
					if (this.triggers) {
						var e = this.normalizeUIKeys(t.result(this, "triggers"));
						return this._getViewTriggers(this.view, e)
					}
				}
			});
		t.extend(Ae.prototype, re, se, ce);
		var Se = ["region", "regionClass"],
			je = Q.extend({
				cidPrefix: "mna",
				constructor: function(e) {
					this._setOptions(e), this.mergeOptions(e, Se), this._initRegion(), Q.prototype.constructor.apply(this, arguments)
				},
				regionClass: he,
				_initRegion: function() {
					var e = this.region;
					if (e) {
						var t = {
							regionClass: this.regionClass
						};
						this._region = I(e, t)
					}
				},
				getRegion: function() {
					return this._region
				},
				showView: function(e) {
					for (var t = this.getRegion(), n = arguments.length, r = Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
					return t.show.apply(t, [e].concat(r))
				},
				getView: function() {
					return this.getRegion().currentView
				},
				start: function(e) {
					return this.triggerMethod("before:start", this, e), this.triggerMethod("start", this, e), this
				}
			}),
			Oe = ["appRoutes", "controller"],
			Ie = e.Router.extend({
				constructor: function(t) {
					this._setOptions(t), this.mergeOptions(t, Oe), e.Router.apply(this, arguments);
					var n = this.appRoutes,
						r = this._getController();
					this.processAppRoutes(r, n), this.on("route", this._processOnRoute, this)
				},
				appRoute: function(e, t) {
					var n = this._getController();
					return this._addAppRoute(n, e, t), this
				},
				_processOnRoute: function(e, n) {
					if (t.isFunction(this.onRoute)) {
						var r = t.invert(this.appRoutes)[e];
						this.onRoute(e, r, n)
					}
				},
				processAppRoutes: function(e, n) {
					var r = this;
					if (!n) return this;
					var i = t.keys(n).reverse();
					return t.each(i, function(t) {
						r._addAppRoute(e, t, n[t])
					}), this
				},
				_getController: function() {
					return this.controller
				},
				_addAppRoute: function(e, n, r) {
					var i = e[r];
					if (!i) throw new J('Method "' + r + '" was not found on the controller');
					this.route(n, r, t.bind(i, e))
				},
				triggerMethod: i
			});
		t.extend(Ie.prototype, Y);
		var Re = {},
			Ne = e.Marionette,
			$e = e.Marionette = {};
		return $e.noConflict = function() {
			return e.Marionette = Ne, this
		}, $e.bindEvents = P(x), $e.unbindEvents = P(w), $e.bindRequests = P(k), $e.unbindRequests = P(T), $e.mergeOptions = P(V), $e.getOption = P(U), $e.normalizeMethods = P(z), $e.extend = B, $e.isNodeAttached = F, $e.deprecate = q, $e.triggerMethod = P(i), $e.triggerMethodOn = o, $e.isEnabled = D, $e.setEnabled = M, $e.monitorViewEvents = y, $e.Behaviors = {}, $e.Behaviors.behaviorsLookup = $, $e.Application = je, $e.AppRouter = Ie, $e.Renderer = ge, $e.TemplateCache = ee, $e.View = ye, $e.CollectionView = _e, $e.CompositeView = Te, $e.Behavior = Ae, $e.Region = he, $e.Error = J, $e.Object = Q, $e.DEV_MODE = !1, $e.FEATURES = Re, $e.VERSION = L, $e
	}), ! function(e, t) {
		"object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define("twig", [], t) : "object" == typeof exports ? exports.Twig = t() : e.Twig = t()
	}(this, function() {
		return function(e) {
			function t(r) {
				if (n[r]) return n[r].exports;
				var i = n[r] = {
					exports: {},
					id: r,
					loaded: !1
				};
				return e[r].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports
			}
			var n = {};
			return t.m = e, t.c = n, t.p = "", t(0)
		}([function(e, t, n) {
			var r = {
				VERSION: "0.8.9"
			};
			n(1)(r), n(2)(r), n(3)(r), n(5)(r), n(6)(r), n(7)(r), n(17)(r), n(18)(r), n(22)(r), n(23)(r), n(24)(r), n(25)(r), n(26)(r), n(27)(r), e.exports = r.exports
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";

				function t(e, t) {
					var n = Object.prototype.toString.call(t).slice(8, -1);
					return void 0 !== t && null !== t && n === e
				}
				return e.trace = !1, e.debug = !1, e.cache = !0, e.placeholders = {
					parent: "{{|PARENT|}}"
				}, e.indexOf = function(e, t) {
					if (Array.prototype.hasOwnProperty("indexOf")) return e.indexOf(t);
					if (void 0 === e || null === e) throw new TypeError;
					var n = Object(e),
						r = n.length >>> 0;
					if (0 === r) return -1;
					var i = 0;
					if (arguments.length > 0 && (i = Number(arguments[1]), i !== i ? i = 0 : 0 !== i && i !== 1 / 0 && i !== -(1 / 0) && (i = (i > 0 || -1) * Math.floor(Math.abs(i)))), i >= r) return -1;
					for (var o = i >= 0 ? i : Math.max(r - Math.abs(i), 0); o < r; o++)
						if (o in n && n[o] === t) return o;
					return e == t ? 0 : -1
				}, e.forEach = function(e, t, n) {
					if (Array.prototype.forEach) return e.forEach(t, n);
					var r, i;
					if (null == e) throw new TypeError(" this is null or not defined");
					var o = Object(e),
						s = o.length >>> 0;
					if ("[object Function]" != {}.toString.call(t)) throw new TypeError(t + " is not a function");
					for (n && (r = n), i = 0; i < s;) {
						var a;
						i in o && (a = o[i], t.call(r, a, i, o)), i++
					}
				}, e.merge = function(t, n, r) {
					return e.forEach(Object.keys(n), function(e) {
						(!r || e in t) && (t[e] = n[e])
					}), t
				}, e.Error = function(e) {
					this.message = e, this.name = "TwigException", this.type = "TwigException"
				}, e.Error.prototype.toString = function() {
					var e = this.name + ": " + this.message;
					return e
				}, e.log = {
					trace: function() {
						e.trace && console && console.log(Array.prototype.slice.call(arguments))
					},
					debug: function() {
						e.debug && console && console.log(Array.prototype.slice.call(arguments))
					}
				}, "undefined" != typeof console ? "undefined" != typeof console.error ? e.log.error = function() {
					console.error.apply(console, arguments)
				} : "undefined" != typeof console.log && (e.log.error = function() {
					console.log.apply(console, arguments)
				}) : e.log.error = function() {}, e.ChildContext = function(e) {
					var t = function() {};
					return t.prototype = e, new t
				}, e.token = {}, e.token.type = {
					output: "output",
					logic: "logic",
					comment: "comment",
					raw: "raw",
					output_whitespace_pre: "output_whitespace_pre",
					output_whitespace_post: "output_whitespace_post",
					output_whitespace_both: "output_whitespace_both",
					logic_whitespace_pre: "logic_whitespace_pre",
					logic_whitespace_post: "logic_whitespace_post",
					logic_whitespace_both: "logic_whitespace_both"
				}, e.token.definitions = [{
					type: e.token.type.raw,
					open: "{% raw %}",
					close: "{% endraw %}"
				}, {
					type: e.token.type.raw,
					open: "{% verbatim %}",
					close: "{% endverbatim %}"
				}, {
					type: e.token.type.output_whitespace_pre,
					open: "{{-",
					close: "}}"
				}, {
					type: e.token.type.output_whitespace_post,
					open: "{{",
					close: "-}}"
				}, {
					type: e.token.type.output_whitespace_both,
					open: "{{-",
					close: "-}}"
				}, {
					type: e.token.type.logic_whitespace_pre,
					open: "{%-",
					close: "%}"
				}, {
					type: e.token.type.logic_whitespace_post,
					open: "{%",
					close: "-%}"
				}, {
					type: e.token.type.logic_whitespace_both,
					open: "{%-",
					close: "-%}"
				}, {
					type: e.token.type.output,
					open: "{{",
					close: "}}"
				}, {
					type: e.token.type.logic,
					open: "{%",
					close: "%}"
				}, {
					type: e.token.type.comment,
					open: "{#",
					close: "#}"
				}], e.token.strings = ['"', "'"], e.token.findStart = function(t) {
					var n, r, i, o, s = {
						position: null,
						close_position: null,
						def: null
					};
					for (n = 0; n < e.token.definitions.length; n++) r = e.token.definitions[n], i = t.indexOf(r.open), o = t.indexOf(r.close), e.log.trace("Twig.token.findStart: ", "Searching for ", r.open, " found at ", i), i >= 0 && r.open.length !== r.close.length && o < 0 || (i >= 0 && (null === s.position || i < s.position) ? (s.position = i, s.def = r, s.close_position = o) : i >= 0 && null !== s.position && i === s.position && (r.open.length > s.def.open.length ? (s.position = i, s.def = r, s.close_position = o) : r.open.length === s.def.open.length && (r.close.length > s.def.close.length ? o >= 0 && o < s.close_position && (s.position = i, s.def = r, s.close_position = o) : o >= 0 && o < s.close_position && (s.position = i, s.def = r, s.close_position = o))));
					return delete s.close_position, s
				}, e.token.findEnd = function(t, n, r) {
					for (var i, o, s = null, a = !1, u = 0, l = null, c = null, p = null, f = null, h = null, d = null; !a;) {
						if (l = null, c = null, p = t.indexOf(n.close, u), !(p >= 0)) throw new e.Error("Unable to find closing bracket '" + n.close + "' opened near template position " + r);
						if (s = p, a = !0, n.type === e.token.type.comment) break;
						if (n.type === e.token.type.raw) break;
						for (o = e.token.strings.length, i = 0; i < o; i += 1) h = t.indexOf(e.token.strings[i], u), h > 0 && h < p && (null === l || h < l) && (l = h, c = e.token.strings[i]);
						if (null !== l)
							for (f = l + 1, s = null, a = !1;;) {
								if (d = t.indexOf(c, f), d < 0) throw "Unclosed string in template";
								if ("\\" !== t.substr(d - 1, 1)) {
									u = d + 1;
									break
								}
								f = d + 1
							}
					}
					return s
				}, e.tokenize = function(t) {
					for (var n = [], r = 0, i = null, o = null; t.length > 0;)
						if (i = e.token.findStart(t), e.log.trace("Twig.tokenize: ", "Found token: ", i), null !== i.position) {
							if (i.position > 0 && n.push({
									type: e.token.type.raw,
									value: t.substring(0, i.position)
								}), t = t.substr(i.position + i.def.open.length), r += i.position + i.def.open.length, o = e.token.findEnd(t, i.def, r), e.log.trace("Twig.tokenize: ", "Token ends at ", o), n.push({
									type: i.def.type,
									value: t.substring(0, o).trim()
								}), "\n" === t.substr(o + i.def.close.length, 1)) switch (i.def.type) {
								case "logic_whitespace_pre":
								case "logic_whitespace_post":
								case "logic_whitespace_both":
								case "logic":
									o += 1
							}
							t = t.substr(o + i.def.close.length), r += o + i.def.close.length
						} else n.push({
							type: e.token.type.raw,
							value: t
						}), t = "";
					return n
				}, e.compile = function(t) {
					try {
						for (var n = [], r = [], i = [], o = null, s = null, a = null, u = null, l = null, c = null, p = null, f = null, h = null, d = null, g = null, v = null, y = function(t) {
								e.expression.compile.apply(this, [t]), r.length > 0 ? i.push(t) : n.push(t)
							}, m = function(t) {
								if (s = e.logic.compile.apply(this, [t]), d = s.type, g = e.logic.handler[d].open, v = e.logic.handler[d].next, e.log.trace("Twig.compile: ", "Compiled logic token to ", s, " next is: ", v, " open is : ", g), void 0 !== g && !g) {
									if (u = r.pop(), p = e.logic.handler[u.type], e.indexOf(p.next, d) < 0) throw new Error(d + " not expected after a " + u.type);
									u.output = u.output || [], u.output = u.output.concat(i), i = [], h = {
										type: e.token.type.logic,
										token: u
									}, r.length > 0 ? i.push(h) : n.push(h)
								}
								void 0 !== v && v.length > 0 ? (e.log.trace("Twig.compile: ", "Pushing ", s, " to logic stack."), r.length > 0 && (u = r.pop(), u.output = u.output || [], u.output = u.output.concat(i), r.push(u), i = []), r.push(s)) : void 0 !== g && g && (h = {
									type: e.token.type.logic,
									token: s
								}, r.length > 0 ? i.push(h) : n.push(h))
							}; t.length > 0;) {
							switch (o = t.shift(), l = n[n.length - 1], c = i[i.length - 1], f = t[0], e.log.trace("Compiling token ", o), o.type) {
								case e.token.type.raw:
									r.length > 0 ? i.push(o) : n.push(o);
									break;
								case e.token.type.logic:
									m.call(this, o);
									break;
								case e.token.type.comment:
									break;
								case e.token.type.output:
									y.call(this, o);
									break;
								case e.token.type.logic_whitespace_pre:
								case e.token.type.logic_whitespace_post:
								case e.token.type.logic_whitespace_both:
								case e.token.type.output_whitespace_pre:
								case e.token.type.output_whitespace_post:
								case e.token.type.output_whitespace_both:
									switch (o.type !== e.token.type.output_whitespace_post && o.type !== e.token.type.logic_whitespace_post && (l && l.type === e.token.type.raw && (n.pop(), null === l.value.match(/^\s*$/) && (l.value = l.value.trim(), n.push(l))), c && c.type === e.token.type.raw && (i.pop(), null === c.value.match(/^\s*$/) && (c.value = c.value.trim(), i.push(c)))), o.type) {
										case e.token.type.output_whitespace_pre:
										case e.token.type.output_whitespace_post:
										case e.token.type.output_whitespace_both:
											y.call(this, o);
											break;
										case e.token.type.logic_whitespace_pre:
										case e.token.type.logic_whitespace_post:
										case e.token.type.logic_whitespace_both:
											m.call(this, o)
									}
									o.type !== e.token.type.output_whitespace_pre && o.type !== e.token.type.logic_whitespace_pre && f && f.type === e.token.type.raw && (t.shift(), null === f.value.match(/^\s*$/) && (f.value = f.value.trim(), t.unshift(f)))
							}
							e.log.trace("Twig.compile: ", " Output: ", n, " Logic Stack: ", r, " Pending Output: ", i)
						}
						if (r.length > 0) throw a = r.pop(), new Error("Unable to find an end tag for " + a.type + ", expecting one of " + a.next);
						return n
					} catch (t) {
						if (e.log.error("Error compiling twig template " + this.id + ": "), t.stack ? e.log.error(t.stack) : e.log.error(t.toString()), this.options.rethrow) throw t
					}
				}, e.parse = function(t, n) {
					try {
						var r = [],
							i = !0,
							o = this;
						return e.forEach(t, function(t) {
							switch (e.log.debug("Twig.parse: ", "Parsing token: ", t), t.type) {
								case e.token.type.raw:
									r.push(e.filters.raw(t.value));
									break;
								case e.token.type.logic:
									var s = t.token,
										a = e.logic.parse.apply(o, [s, n, i]);
									void 0 !== a.chain && (i = a.chain), void 0 !== a.context && (n = a.context), void 0 !== a.output && r.push(a.output);
									break;
								case e.token.type.comment:
									break;
								case e.token.type.output_whitespace_pre:
								case e.token.type.output_whitespace_post:
								case e.token.type.output_whitespace_both:
								case e.token.type.output:
									e.log.debug("Twig.parse: ", "Output token: ", t.stack), r.push(e.expression.parse.apply(o, [t.stack, n]))
							}
						}), e.output.apply(this, [r])
					} catch (t) {
						if (e.log.error("Error parsing twig template " + this.id + ": "), t.stack ? e.log.error(t.stack) : e.log.error(t.toString()), this.options.rethrow) throw t;
						if (e.debug) return t.toString()
					}
				}, e.prepare = function(t) {
					var n, r;
					return e.log.debug("Twig.prepare: ", "Tokenizing ", t), r = e.tokenize.apply(this, [t]), e.log.debug("Twig.prepare: ", "Compiling ", r), n = e.compile.apply(this, [r]), e.log.debug("Twig.prepare: ", "Compiled ", n), n
				}, e.output = function(t) {
					if (!this.options.autoescape) return t.join("");
					var n = "html";
					"string" == typeof this.options.autoescape && (n = this.options.autoescape);
					var r = [];
					return e.forEach(t, function(t) {
						t && t.twig_markup !== !0 && t.twig_markup != n && (t = e.filters.escape(t, [n])), r.push(t)
					}), e.Markup(r.join(""))
				}, e.Templates = {
					loaders: {},
					parsers: {},
					registry: {}
				}, e.validateId = function(t) {
					if ("prototype" === t) throw new e.Error(t + " is not a valid twig identifier");
					if (e.cache && e.Templates.registry.hasOwnProperty(t)) throw new e.Error("There is already a template with the ID " + t);
					return !0
				}, e.Templates.registerLoader = function(t, n, r) {
					if ("function" != typeof n) throw new e.Error("Unable to add loader for " + t + ": Invalid function reference given.");
					r && (n = n.bind(r)), this.loaders[t] = n
				}, e.Templates.unRegisterLoader = function(e) {
					this.isRegisteredLoader(e) && delete this.loaders[e]
				}, e.Templates.isRegisteredLoader = function(e) {
					return this.loaders.hasOwnProperty(e)
				}, e.Templates.registerParser = function(t, n, r) {
					if ("function" != typeof n) throw new e.Error("Unable to add parser for " + t + ": Invalid function regerence given.");
					r && (n = n.bind(r)), this.parsers[t] = n
				}, e.Templates.unRegisterParser = function(e) {
					this.isRegisteredParser(e) && delete this.parsers[e]
				}, e.Templates.isRegisteredParser = function(e) {
					return this.parsers.hasOwnProperty(e)
				}, e.Templates.save = function(t) {
					if (void 0 === t.id) throw new e.Error("Unable to save template with no id");
					e.Templates.registry[t.id] = t
				}, e.Templates.load = function(t) {
					return e.Templates.registry.hasOwnProperty(t) ? e.Templates.registry[t] : null
				}, e.Templates.loadRemote = function(t, n, r, i) {
					var o;
					return void 0 === n.async && (n.async = !0), void 0 === n.id && (n.id = t), e.cache && e.Templates.registry.hasOwnProperty(n.id) ? ("function" == typeof r && r(e.Templates.registry[n.id]), e.Templates.registry[n.id]) : (n.parser = n.parser || "twig", o = this.loaders[n.method] || this.loaders.fs, o.apply(this, arguments))
				}, e.Template = function(n) {
					var r = n.data,
						i = n.id,
						o = n.blocks,
						s = n.macros || {},
						a = n.base,
						u = n.path,
						l = n.url,
						c = n.name,
						p = n.method,
						f = n.options;
					this.id = i, this.method = p, this.base = a, this.path = u, this.url = l, this.name = c, this.macros = s, this.options = f, this.reset(o), t("String", r) ? this.tokens = e.prepare.apply(this, [r]) : this.tokens = r, void 0 !== i && e.Templates.save(this)
				}, e.Template.prototype.reset = function(t) {
					e.log.debug("Twig.Template.reset", "Reseting template " + this.id), this.blocks = {}, this.importedBlocks = [], this.originalBlockTokens = {}, this.child = {
						blocks: t || {}
					}, this.extend = null
				}, e.Template.prototype.render = function(t, n) {
					n = n || {};
					var r, i;
					if (this.context = t || {}, this.reset(), n.blocks && (this.blocks = n.blocks), n.macros && (this.macros = n.macros), r = e.parse.apply(this, [this.tokens, this.context]), this.extend) {
						var o;
						return this.options.allowInlineIncludes && (o = e.Templates.load(this.extend), o && (o.options = this.options)), o || (i = e.path.parsePath(this, this.extend), o = e.Templates.loadRemote(i, {
							method: this.getLoaderMethod(),
							base: this.base,
							async: !1,
							id: i,
							options: this.options
						})), this.parent = o, this.parent.render(this.context, {
							blocks: this.blocks
						})
					}
					return "blocks" == n.output ? this.blocks : "macros" == n.output ? this.macros : r
				}, e.Template.prototype.importFile = function(t) {
					var n, r;
					if (!this.url && this.options.allowInlineIncludes) {
						if (t = this.path ? this.path + "/" + t : t, r = e.Templates.load(t), !r && (r = e.Templates.loadRemote(n, {
								id: t,
								method: this.getLoaderMethod(),
								async: !1,
								options: this.options
							}), !r)) throw new e.Error("Unable to find the template " + t);
						return r.options = this.options, r
					}
					return n = e.path.parsePath(this, t), r = e.Templates.loadRemote(n, {
						method: this.getLoaderMethod(),
						base: this.base,
						async: !1,
						options: this.options,
						id: n
					})
				}, e.Template.prototype.importBlocks = function(t, n) {
					var r = this.importFile(t),
						i = this.context,
						o = this;
					n = n || !1, r.render(i), e.forEach(Object.keys(r.blocks), function(e) {
						(n || void 0 === o.blocks[e]) && (o.blocks[e] = r.blocks[e], o.importedBlocks.push(e))
					})
				}, e.Template.prototype.importMacros = function(t) {
					var n = e.path.parsePath(this, t),
						r = e.Templates.loadRemote(n, {
							method: this.getLoaderMethod(),
							async: !1,
							id: n
						});
					return r
				}, e.Template.prototype.getLoaderMethod = function() {
					return this.path ? "fs" : this.url ? "ajax" : this.method || "fs"
				}, e.Template.prototype.compile = function(t) {
					return e.compiler.compile(this, t)
				}, e.Markup = function(e, t) {
					return "undefined" == typeof t && (t = !0), "string" == typeof e && e.length > 0 && (e = new String(e), e.twig_markup = t), e
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				return e.compiler = {
					module: {}
				}, e.compiler.compile = function(t, n) {
					var r, i = JSON.stringify(t.tokens),
						o = t.id;
					if (n.module) {
						if (void 0 === e.compiler.module[n.module]) throw new e.Error("Unable to find module type " + n.module);
						r = e.compiler.module[n.module](o, i, n.twig)
					} else r = e.compiler.wrap(o, i);
					return r
				}, e.compiler.module = {
					amd: function(t, n, r) {
						return 'define(["' + r + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + e.compiler.wrap(t, n) + "\n\treturn templates;\n});"
					},
					node: function(t, n) {
						return 'var twig = require("twig").twig;\nexports.template = ' + e.compiler.wrap(t, n)
					},
					cjs2: function(t, n, r) {
						return 'module.declare([{ twig: "' + r + '" }], function (require, exports, module) {\n\tvar twig = require("twig").twig;\n\texports.template = ' + e.compiler.wrap(t, n) + "\n});"
					}
				}, e.compiler.wrap = function(e, t) {
					return 'twig({id:"' + e.replace('"', '\\"') + '", data:' + t + ", precompiled: true});\n"
				}, e
			}
		}, function(e, t, n) {
			e.exports = function(e) {
				"use strict";
				e.expression = {}, n(4)(e), e.expression.reservedWords = ["true", "false", "null", "TRUE", "FALSE", "NULL", "_context", "and", "or", "in", "not in", "if"], e.expression.type = {
					comma: "Twig.expression.type.comma",
					operator: {
						unary: "Twig.expression.type.operator.unary",
						binary: "Twig.expression.type.operator.binary"
					},
					string: "Twig.expression.type.string",
					bool: "Twig.expression.type.bool",
					slice: "Twig.expression.type.slice",
					array: {
						start: "Twig.expression.type.array.start",
						end: "Twig.expression.type.array.end"
					},
					object: {
						start: "Twig.expression.type.object.start",
						end: "Twig.expression.type.object.end"
					},
					parameter: {
						start: "Twig.expression.type.parameter.start",
						end: "Twig.expression.type.parameter.end"
					},
					subexpression: {
						start: "Twig.expression.type.subexpression.start",
						end: "Twig.expression.type.subexpression.end"
					},
					key: {
						period: "Twig.expression.type.key.period",
						brackets: "Twig.expression.type.key.brackets"
					},
					filter: "Twig.expression.type.filter",
					_function: "Twig.expression.type._function",
					variable: "Twig.expression.type.variable",
					number: "Twig.expression.type.number",
					_null: "Twig.expression.type.null",
					context: "Twig.expression.type.context",
					test: "Twig.expression.type.test"
				}, e.expression.set = {
					operations: [e.expression.type.filter, e.expression.type.operator.unary, e.expression.type.operator.binary, e.expression.type.array.end, e.expression.type.object.end, e.expression.type.parameter.end, e.expression.type.subexpression.end, e.expression.type.comma, e.expression.type.test],
					expressions: [e.expression.type._function, e.expression.type.bool, e.expression.type.string, e.expression.type.variable, e.expression.type.number, e.expression.type._null, e.expression.type.context, e.expression.type.parameter.start, e.expression.type.array.start, e.expression.type.object.start, e.expression.type.subexpression.start]
				}, e.expression.set.operations_extended = e.expression.set.operations.concat([e.expression.type.key.period, e.expression.type.key.brackets, e.expression.type.slice]), e.expression.fn = {
					compile: {
						push: function(e, t, n) {
							n.push(e)
						},
						push_both: function(e, t, n) {
							n.push(e), t.push(e)
						}
					},
					parse: {
						push: function(e, t, n) {
							t.push(e)
						},
						push_value: function(e, t, n) {
							t.push(e.value)
						}
					}
				}, e.expression.definitions = [{
					type: e.expression.type.test,
					regex: /^is\s+(not)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/,
					next: e.expression.set.operations.concat([e.expression.type.parameter.start]),
					compile: function(e, t, n) {
						e.filter = e.match[2], e.modifier = e.match[1], delete e.match, delete e.value, n.push(e)
					},
					parse: function(t, n, r) {
						var i = n.pop(),
							o = t.params && e.expression.parse.apply(this, [t.params, r]),
							s = e.test(t.filter, i, o);
						"not" == t.modifier ? n.push(!s) : n.push(s)
					}
				}, {
					type: e.expression.type.comma,
					regex: /^,/,
					next: e.expression.set.expressions.concat([e.expression.type.array.end, e.expression.type.object.end]),
					compile: function(t, n, r) {
						var i, o = n.length - 1;
						for (delete t.match, delete t.value; o >= 0; o--) {
							if (i = n.pop(), i.type === e.expression.type.object.start || i.type === e.expression.type.parameter.start || i.type === e.expression.type.array.start) {
								n.push(i);
								break
							}
							r.push(i)
						}
						r.push(t)
					}
				}, {
					type: e.expression.type.number,
					regex: /^\-?\d+(\.\d+)?/,
					next: e.expression.set.operations,
					compile: function(e, t, n) {
						e.value = Number(e.value), n.push(e)
					},
					parse: e.expression.fn.parse.push_value
				}, {
					type: e.expression.type.operator.binary,
					regex: /(^\?\:|^[\+\-~%\?]|^[\:](?!\d\])|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^(and)[\(|\s+]|^(or)[\(|\s+]|^(in)[\(|\s+]|^(not in)[\(|\s+]|^\.\.)/,
					next: e.expression.set.expressions.concat([e.expression.type.operator.unary]),
					transform: function(e, t) {
						switch (e[0]) {
							case "and(":
							case "or(":
							case "in(":
							case "not in(":
								return t[t.length - 1].value = e[2], e[0];
							default:
								return ""
						}
					},
					compile: function(t, n, r) {
						delete t.match, t.value = t.value.trim();
						var i = t.value,
							o = e.expression.operator.lookup(i, t);
						for (e.log.trace("Twig.expression.compile: ", "Operator: ", o, " from ", i); n.length > 0 && (n[n.length - 1].type == e.expression.type.operator.unary || n[n.length - 1].type == e.expression.type.operator.binary) && (o.associativity === e.expression.operator.leftToRight && o.precidence >= n[n.length - 1].precidence || o.associativity === e.expression.operator.rightToLeft && o.precidence > n[n.length - 1].precidence);) {
							var s = n.pop();
							r.push(s)
						}
						if (":" === i) {
							if (!n[n.length - 1] || "?" !== n[n.length - 1].value) {
								var a = r.pop();
								if (a.type === e.expression.type.string || a.type === e.expression.type.variable) t.key = a.value;
								else if (a.type === e.expression.type.number) t.key = a.value.toString();
								else {
									if (!a.expression || a.type !== e.expression.type.parameter.end && a.type != e.expression.type.subexpression.end) throw new e.Error("Unexpected value before ':' of " + a.type + " = " + a.value);
									t.params = a.params
								}
								return void r.push(t)
							}
						} else n.push(o)
					},
					parse: function(t, n, r) {
						t.key ? n.push(t) : t.params ? (t.key = e.expression.parse.apply(this, [t.params, r]), n.push(t), r.loop || delete t.params) : e.expression.operator.parse(t.value, n)
					}
				}, {
					type: e.expression.type.operator.unary,
					regex: /(^not\s+)/,
					next: e.expression.set.expressions,
					compile: function(t, n, r) {
						delete t.match, t.value = t.value.trim();
						var i = t.value,
							o = e.expression.operator.lookup(i, t);
						for (e.log.trace("Twig.expression.compile: ", "Operator: ", o, " from ", i); n.length > 0 && (n[n.length - 1].type == e.expression.type.operator.unary || n[n.length - 1].type == e.expression.type.operator.binary) && (o.associativity === e.expression.operator.leftToRight && o.precidence >= n[n.length - 1].precidence || o.associativity === e.expression.operator.rightToLeft && o.precidence > n[n.length - 1].precidence);) {
							var s = n.pop();
							r.push(s)
						}
						n.push(o)
					},
					parse: function(t, n, r) {
						e.expression.operator.parse(t.value, n)
					}
				}, {
					type: e.expression.type.string,
					regex: /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/,
					next: e.expression.set.operations_extended,
					compile: function(t, n, r) {
						var i = t.value;
						delete t.match, i = '"' === i.substring(0, 1) ? i.replace('\\"', '"') : i.replace("\\'", "'"), t.value = i.substring(1, i.length - 1).replace(/\\n/g, "\n").replace(/\\r/g, "\r"), e.log.trace("Twig.expression.compile: ", "String value: ", t.value), r.push(t)
					},
					parse: e.expression.fn.parse.push_value
				}, {
					type: e.expression.type.subexpression.start,
					regex: /^\(/,
					next: e.expression.set.expressions.concat([e.expression.type.subexpression.end]),
					compile: function(e, t, n) {
						e.value = "(", n.push(e), t.push(e)
					},
					parse: e.expression.fn.parse.push
				}, {
					type: e.expression.type.subexpression.end,
					regex: /^\)/,
					next: e.expression.set.operations_extended,
					validate: function(t, n) {
						for (var r = n.length - 1, i = !1, o = !1, s = 0; !i && r >= 0;) {
							var a = n[r];
							i = a.type === e.expression.type.subexpression.start, i && o && (o = !1, i = !1), a.type === e.expression.type.parameter.start ? s++ : a.type === e.expression.type.parameter.end ? s-- : a.type === e.expression.type.subexpression.end && (o = !0), r--
						}
						return i && 0 === s
					},
					compile: function(t, n, r) {
						var i, o = t;
						for (i = n.pop(); n.length > 0 && i.type != e.expression.type.subexpression.start;) r.push(i), i = n.pop();
						for (var s = []; t.type !== e.expression.type.subexpression.start;) s.unshift(t), t = r.pop();
						s.unshift(t), i = n[n.length - 1], void 0 === i || i.type !== e.expression.type._function && i.type !== e.expression.type.filter && i.type !== e.expression.type.test && i.type !== e.expression.type.key.brackets ? (o.expression = !0, s.pop(), s.shift(), o.params = s, r.push(o)) : (o.expression = !1, i.params = s)
					},
					parse: function(t, n, r) {
						var i = null;
						if (!t.expression) throw new e.Error("Unexpected subexpression end when token is not marked as an expression");
						i = e.expression.parse.apply(this, [t.params, r]), n.push(i)
					}
				}, {
					type: e.expression.type.parameter.start,
					regex: /^\(/,
					next: e.expression.set.expressions.concat([e.expression.type.parameter.end]),
					validate: function(t, n) {
						var r = n[n.length - 1];
						return r && e.indexOf(e.expression.reservedWords, r.value.trim()) < 0
					},
					compile: e.expression.fn.compile.push_both,
					parse: e.expression.fn.parse.push
				}, {
					type: e.expression.type.parameter.end,
					regex: /^\)/,
					next: e.expression.set.operations_extended,
					compile: function(t, n, r) {
						var i, o = t;
						for (i = n.pop(); n.length > 0 && i.type != e.expression.type.parameter.start;) r.push(i), i = n.pop();
						for (var s = []; t.type !== e.expression.type.parameter.start;) s.unshift(t), t = r.pop();
						s.unshift(t), t = r[r.length - 1], void 0 === t || t.type !== e.expression.type._function && t.type !== e.expression.type.filter && t.type !== e.expression.type.test && t.type !== e.expression.type.key.brackets ? (o.expression = !0, s.pop(), s.shift(), o.params = s, r.push(o)) : (o.expression = !1, t.params = s)
					},
					parse: function(t, n, r) {
						var i = [],
							o = !1,
							s = null;
						if (t.expression) s = e.expression.parse.apply(this, [t.params, r]), n.push(s);
						else {
							for (; n.length > 0;) {
								if (s = n.pop(), s && s.type && s.type == e.expression.type.parameter.start) {
									o = !0;
									break
								}
								i.unshift(s)
							}
							if (!o) throw new e.Error("Expected end of parameter set.");
							n.push(i)
						}
					}
				}, {
					type: e.expression.type.slice,
					regex: /^\[(\d*\:\d*)\]/,
					next: e.expression.set.operations_extended,
					compile: function(e, t, n) {
						var r = e.match[1].split(":"),
							i = r[0] ? parseInt(r[0]) : void 0,
							o = r[1] ? parseInt(r[1]) : void 0;
						e.value = "slice", e.params = [i, o], o || (e.params = [i]), n.push(e)
					},
					parse: function(t, n, r) {
						var i = n.pop(),
							o = t.params;
						n.push(e.filter.apply(this, [t.value, i, o]))
					}
				}, {
					type: e.expression.type.array.start,
					regex: /^\[/,
					next: e.expression.set.expressions.concat([e.expression.type.array.end]),
					compile: e.expression.fn.compile.push_both,
					parse: e.expression.fn.parse.push
				}, {
					type: e.expression.type.array.end,
					regex: /^\]/,
					next: e.expression.set.operations_extended,
					compile: function(t, n, r) {
						for (var i, o = n.length - 1; o >= 0 && (i = n.pop(), i.type !== e.expression.type.array.start); o--) r.push(i);
						r.push(t)
					},
					parse: function(t, n, r) {
						for (var i = [], o = !1, s = null; n.length > 0;) {
							if (s = n.pop(), s.type && s.type == e.expression.type.array.start) {
								o = !0;
								break
							}
							i.unshift(s)
						}
						if (!o) throw new e.Error("Expected end of array.");
						n.push(i)
					}
				}, {
					type: e.expression.type.object.start,
					regex: /^\{/,
					next: e.expression.set.expressions.concat([e.expression.type.object.end]),
					compile: e.expression.fn.compile.push_both,
					parse: e.expression.fn.parse.push
				}, {
					type: e.expression.type.object.end,
					regex: /^\}/,
					next: e.expression.set.operations_extended,
					compile: function(t, n, r) {
						for (var i, o = n.length - 1; o >= 0 && (i = n.pop(), !i || i.type !== e.expression.type.object.start); o--) r.push(i);
						r.push(t)
					},
					parse: function(t, n, r) {
						for (var i = {}, o = !1, s = null, a = !1, u = null; n.length > 0;) {
							if (s = n.pop(), s && s.type && s.type === e.expression.type.object.start) {
								o = !0;
								break
							}
							if (s && s.type && (s.type === e.expression.type.operator.binary || s.type === e.expression.type.operator.unary) && s.key) {
								if (!a) throw new e.Error("Missing value for key '" + s.key + "' in object definition.");
								i[s.key] = u, void 0 === i._keys && (i._keys = []), i._keys.unshift(s.key), u = null, a = !1
							} else a = !0, u = s
						}
						if (!o) throw new e.Error("Unexpected end of object.");
						n.push(i)
					}
				}, {
					type: e.expression.type.filter,
					regex: /^\|\s?([a-zA-Z_][a-zA-Z0-9_\-]*)/,
					next: e.expression.set.operations_extended.concat([e.expression.type.parameter.start]),
					compile: function(e, t, n) {
						e.value = e.match[1], n.push(e)
					},
					parse: function(t, n, r) {
						var i = n.pop(),
							o = t.params && e.expression.parse.apply(this, [t.params, r]);
						n.push(e.filter.apply(this, [t.value, i, o]))
					}
				}, {
					type: e.expression.type._function,
					regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
					next: e.expression.type.parameter.start,
					validate: function(t, n) {
						return t[1] && e.indexOf(e.expression.reservedWords, t[1]) < 0
					},
					transform: function(e, t) {
						return "("
					},
					compile: function(e, t, n) {
						var r = e.match[1];
						e.fn = r, delete e.match, delete e.value, n.push(e)
					},
					parse: function(t, n, r) {
						var i, o = t.params && e.expression.parse.apply(this, [t.params, r]),
							s = t.fn;
						if (e.functions[s]) i = e.functions[s].apply(this, o);
						else {
							if ("function" != typeof r[s]) throw new e.Error(s + " function does not exist and is not defined in the context");
							i = r[s].apply(r, o)
						}
						n.push(i)
					}
				}, {
					type: e.expression.type.variable,
					regex: /^[a-zA-Z_][a-zA-Z0-9_]*/,
					next: e.expression.set.operations_extended.concat([e.expression.type.parameter.start]),
					compile: e.expression.fn.compile.push,
					validate: function(t, n) {
						return e.indexOf(e.expression.reservedWords, t[0]) < 0
					},
					parse: function(t, n, r) {
						var i = e.expression.resolve.apply(this, [r[t.value], r]);
						n.push(i)
					}
				}, {
					type: e.expression.type.key.period,
					regex: /^\.([a-zA-Z0-9_]+)/,
					next: e.expression.set.operations_extended.concat([e.expression.type.parameter.start]),
					compile: function(e, t, n) {
						e.key = e.match[1], delete e.match, delete e.value, n.push(e)
					},
					parse: function(t, n, r, i) {
						var o, s = t.params && e.expression.parse.apply(this, [t.params, r]),
							a = t.key,
							u = n.pop();
						if (null === u || void 0 === u) {
							if (this.options.strict_variables) throw new e.Error("Can't access a key " + a + " on an null or undefined object.");
							o = void 0
						} else {
							var l = function(e) {
								return e.substr(0, 1).toUpperCase() + e.substr(1)
							};
							o = "object" == typeof u && a in u ? u[a] : void 0 !== u["get" + l(a)] ? u["get" + l(a)] : void 0 !== u["is" + l(a)] ? u["is" + l(a)] : void 0
						}
						n.push(e.expression.resolve.apply(this, [o, r, s, i]))
					}
				}, {
					type: e.expression.type.key.brackets,
					regex: /^\[([^\]\:]*)\]/,
					next: e.expression.set.operations_extended.concat([e.expression.type.parameter.start]),
					compile: function(t, n, r) {
						var i = t.match[1];
						delete t.value, delete t.match, t.stack = e.expression.compile({
							value: i
						}).stack, r.push(t)
					},
					parse: function(t, n, r, i) {
						var o, s = t.params && e.expression.parse.apply(this, [t.params, r]),
							a = e.expression.parse.apply(this, [t.stack, r]),
							u = n.pop();
						if (null === u || void 0 === u) {
							if (this.options.strict_variables) throw new e.Error("Can't access a key " + a + " on an null or undefined object.");
							return null
						}
						o = "object" == typeof u && a in u ? u[a] : null, n.push(e.expression.resolve.apply(this, [o, u, s, i]))
					}
				}, {
					type: e.expression.type._null,
					regex: /^(null|NULL|none|NONE)/,
					next: e.expression.set.operations,
					compile: function(e, t, n) {
						delete e.match, e.value = null, n.push(e)
					},
					parse: e.expression.fn.parse.push_value
				}, {
					type: e.expression.type.context,
					regex: /^_context/,
					next: e.expression.set.operations_extended.concat([e.expression.type.parameter.start]),
					compile: e.expression.fn.compile.push,
					parse: function(e, t, n) {
						t.push(n)
					}
				}, {
					type: e.expression.type.bool,
					regex: /^(true|TRUE|false|FALSE)/,
					next: e.expression.set.operations,
					compile: function(e, t, n) {
						e.value = "true" === e.match[0].toLowerCase(), delete e.match, n.push(e)
					},
					parse: e.expression.fn.parse.push_value
				}], e.expression.resolve = function(t, n, r, i) {
					if ("function" == typeof t) {
						if (i && i.type === e.expression.type.parameter.end) {
							var o = !0;
							r = i.params && e.expression.parse.apply(this, [i.params, n, o]), i.cleanup = !0
						}
						return t.apply(n, r || [])
					}
					return t
				}, e.expression.handler = {}, e.expression.extendType = function(t) {
					e.expression.type[t] = "Twig.expression.type." + t
				}, e.expression.extend = function(t) {
					if (!t.type) throw new e.Error("Unable to extend logic definition. No type provided for " + t);
					e.expression.handler[t.type] = t
				};
				for (; e.expression.definitions.length > 0;) e.expression.extend(e.expression.definitions.shift());
				return e.expression.tokenize = function(t) {
					var n, r, i, o, s, a, u = [],
						l = 0,
						c = null,
						p = [];
					for (a = function() {
							var t = Array.prototype.slice.apply(arguments);
							return t.pop(), t.pop(), e.log.trace("Twig.expression.tokenize", "Matched a ", n, " regular expression of ", t), c && e.indexOf(c, n) < 0 ? (p.push(n + " cannot follow a " + u[u.length - 1].type + " at template:" + l + " near '" + t[0].substring(0, 20) + "...'"), t[0]) : e.expression.handler[n].validate && !e.expression.handler[n].validate(t, u) ? t[0] : (p = [], u.push({
								type: n,
								value: t[0],
								match: t
							}), s = !0, c = o, l += t[0].length, e.expression.handler[n].transform ? e.expression.handler[n].transform(t, u) : "")
						}, e.log.debug("Twig.expression.tokenize", "Tokenizing expression ", t); t.length > 0;) {
						t = t.trim();
						for (n in e.expression.handler)
							if (e.expression.handler.hasOwnProperty(n)) {
								for (o = e.expression.handler[n].next, r = e.expression.handler[n].regex, e.log.trace("Checking type ", n, " on ", t), i = r instanceof Array ? r : [r], s = !1; i.length > 0;) r = i.pop(), t = t.replace(r, a);
								if (s) break
							}
						if (!s) throw p.length > 0 ? new e.Error(p.join(" OR ")) : new e.Error("Unable to parse '" + t + "' at template position" + l)
					}
					return e.log.trace("Twig.expression.tokenize", "Tokenized to ", u), u
				}, e.expression.compile = function(t) {
					var n = t.value,
						r = e.expression.tokenize(n),
						i = null,
						o = [],
						s = [],
						a = null;
					for (e.log.trace("Twig.expression.compile: ", "Compiling ", n); r.length > 0;) i = r.shift(), a = e.expression.handler[i.type], e.log.trace("Twig.expression.compile: ", "Compiling ", i), a.compile && a.compile(i, s, o), e.log.trace("Twig.expression.compile: ", "Stack is", s), e.log.trace("Twig.expression.compile: ", "Output is", o);
					for (; s.length > 0;) o.push(s.pop());
					return e.log.trace("Twig.expression.compile: ", "Final output is", o), t.stack = o, delete t.value, t
				}, e.expression.parse = function(t, n, r) {
					var i = this;
					t instanceof Array || (t = [t]);
					var o, s = [],
						a = null,
						u = [];
					if (e.forEach(t, function(r, l) {
							r.cleanup || (t.length > l + 1 && (o = t[l + 1]), a = e.expression.handler[r.type], a.parse && a.parse.apply(i, [r, s, n, o]), n.loop && r.type === e.expression.type.operator.binary && u.push(r))
						}), e.forEach(u, function(e) {
							e.params && e.key && delete e.key
						}), r) {
						for (var l = []; s.length > 0;) l.unshift(s.pop());
						s.push(l)
					}
					return s.pop()
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				e.expression.operator = {
					leftToRight: "leftToRight",
					rightToLeft: "rightToLeft"
				};
				var t = function(e, t) {
					if (void 0 === t || null === t) return null;
					if (void 0 !== t.indexOf) return e === t || "" !== e && t.indexOf(e) > -1;
					var n;
					for (n in t)
						if (t.hasOwnProperty(n) && t[n] === e) return !0;
					return !1
				};
				return e.expression.operator.lookup = function(t, n) {
					switch (t) {
						case "..":
							n.precidence = 20, n.associativity = e.expression.operator.leftToRight;
							break;
						case ",":
							n.precidence = 18, n.associativity = e.expression.operator.leftToRight;
							break;
						case "?:":
						case "?":
						case ":":
							n.precidence = 16, n.associativity = e.expression.operator.rightToLeft;
							break;
						case "or":
							n.precidence = 14, n.associativity = e.expression.operator.leftToRight;
							break;
						case "and":
							n.precidence = 13, n.associativity = e.expression.operator.leftToRight;
							break;
						case "==":
						case "!=":
							n.precidence = 9, n.associativity = e.expression.operator.leftToRight;
							break;
						case "<":
						case "<=":
						case ">":
						case ">=":
						case "not in":
						case "in":
							n.precidence = 8, n.associativity = e.expression.operator.leftToRight;
							break;
						case "~":
						case "+":
						case "-":
							n.precidence = 6, n.associativity = e.expression.operator.leftToRight;
							break;
						case "//":
						case "**":
						case "*":
						case "/":
						case "%":
							n.precidence = 5, n.associativity = e.expression.operator.leftToRight;
							break;
						case "not":
							n.precidence = 3, n.associativity = e.expression.operator.rightToLeft;
							break;
						default:
							throw new e.Error("Failed to lookup operator: " + t + " is an unknown operator.")
					}
					return n.operator = t, n
				}, e.expression.operator.parse = function(n, r) {
					e.log.trace("Twig.expression.operator.parse: ", "Handling ", n);
					var i, o, s;
					switch ("?" === n && (s = r.pop()), o = r.pop(), "not" !== n && (i = r.pop()), "in" !== n && "not in" !== n && (i && Array.isArray(i) && (i = i.length), o && Array.isArray(o) && (o = o.length)), n) {
						case ":":
							break;
						case "?:":
							e.lib.boolval(i) ? r.push(i) : r.push(o);
							break;
						case "?":
							void 0 === i && (i = o, o = s, s = void 0), e.lib.boolval(i) ? r.push(o) : r.push(s);
							break;
						case "+":
							o = parseFloat(o), i = parseFloat(i), r.push(i + o);
							break;
						case "-":
							o = parseFloat(o), i = parseFloat(i), r.push(i - o);
							break;
						case "*":
							o = parseFloat(o), i = parseFloat(i), r.push(i * o);
							break;
						case "/":
							o = parseFloat(o), i = parseFloat(i), r.push(i / o);
							break;
						case "//":
							o = parseFloat(o), i = parseFloat(i), r.push(Math.floor(i / o));
							break;
						case "%":
							o = parseFloat(o), i = parseFloat(i), r.push(i % o);
							break;
						case "~":
							r.push((null != i ? i.toString() : "") + (null != o ? o.toString() : ""));
							break;
						case "not":
						case "!":
							r.push(!e.lib.boolval(o));
							break;
						case "<":
							r.push(i < o);
							break;
						case "<=":
							r.push(i <= o);
							break;
						case ">":
							r.push(i > o);
							break;
						case ">=":
							r.push(i >= o);
							break;
						case "===":
							r.push(i === o);
							break;
						case "==":
							r.push(i == o);
							break;
						case "!==":
							r.push(i !== o);
							break;
						case "!=":
							r.push(i != o);
							break;
						case "or":
							r.push(i || o);
							break;
						case "and":
							r.push(i && o);
							break;
						case "**":
							r.push(Math.pow(i, o));
							break;
						case "not in":
							r.push(!t(i, o));
							break;
						case "in":
							r.push(t(i, o));
							break;
						case "..":
							r.push(e.functions.range(i, o));
							break;
						default:
							throw new e.Error("Failed to parse operator: " + n + " is an unknown operator.")
					}
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				function t(e, t) {
					var n = Object.prototype.toString.call(t).slice(8, -1);
					return void 0 !== t && null !== t && n === e
				}
				return e.filters = {
					upper: function(e) {
						return "string" != typeof e ? e : e.toUpperCase()
					},
					lower: function(e) {
						return "string" != typeof e ? e : e.toLowerCase()
					},
					capitalize: function(e) {
						return "string" != typeof e ? e : e.substr(0, 1).toUpperCase() + e.toLowerCase().substr(1)
					},
					title: function(e) {
						return "string" != typeof e ? e : e.toLowerCase().replace(/(^|\s)([a-z])/g, function(e, t, n) {
							return t + n.toUpperCase()
						})
					},
					length: function(t) {
						return e.lib.is("Array", t) || "string" == typeof t ? t.length : e.lib.is("Object", t) ? void 0 === t._keys ? Object.keys(t).length : t._keys.length : 0
					},
					reverse: function(e) {
						if (t("Array", e)) return e.reverse();
						if (t("String", e)) return e.split("").reverse().join("");
						if (t("Object", e)) {
							var n = e._keys || Object.keys(e).reverse();
							return e._keys = n, e
						}
					},
					sort: function(e) {
						if (t("Array", e)) return e.sort();
						if (t("Object", e)) {
							delete e._keys;
							var n = Object.keys(e),
								r = n.sort(function(t, n) {
									var r;
									return e[t] > e[n] == !(e[t] <= e[n]) ? e[t] > e[n] ? 1 : e[t] < e[n] ? -1 : 0 : isNaN(r = parseFloat(e[t])) || isNaN(b1 = parseFloat(e[n])) ? "string" == typeof e[t] ? e[t] > e[n].toString() ? 1 : e[t] < e[n].toString() ? -1 : 0 : "string" == typeof e[n] ? e[t].toString() > e[n] ? 1 : e[t].toString() < e[n] ? -1 : 0 : null : r > b1 ? 1 : r < b1 ? -1 : 0
								});
							return e._keys = r, e
						}
					},
					keys: function(t) {
						if (void 0 !== t && null !== t) {
							var n = t._keys || Object.keys(t),
								r = [];
							return e.forEach(n, function(e) {
								"_keys" !== e && t.hasOwnProperty(e) && r.push(e)
							}), r
						}
					},
					url_encode: function(e) {
						if (void 0 !== e && null !== e) {
							var t = encodeURIComponent(e);
							return t = t.replace("'", "%27")
						}
					},
					join: function(n, r) {
						if (void 0 !== n && null !== n) {
							var i = "",
								o = [],
								s = null;
							return r && r[0] && (i = r[0]), t("Array", n) ? o = n : (s = n._keys || Object.keys(n), e.forEach(s, function(e) {
								"_keys" !== e && n.hasOwnProperty(e) && o.push(n[e])
							})), o.join(i)
						}
					},
					default: function(t, n) {
						if (void 0 !== n && n.length > 1) throw new e.Error("default filter expects one argument");
						return void 0 === t || null === t || "" === t ? void 0 === n ? "" : n[0] : t
					},
					json_encode: function(n) {
						if (void 0 === n || null === n) return "null";
						if ("object" == typeof n && t("Array", n)) return i = [], e.forEach(n, function(t) {
							i.push(e.filters.json_encode(t))
						}), "[" + i.join(",") + "]";
						if ("object" == typeof n) {
							var r = n._keys || Object.keys(n),
								i = [];
							return e.forEach(r, function(t) {
								i.push(JSON.stringify(t) + ":" + e.filters.json_encode(n[t]))
							}), "{" + i.join(",") + "}"
						}
						return JSON.stringify(n)
					},
					merge: function(n, r) {
						var i = [],
							o = 0,
							s = [];
						if (t("Array", n) ? e.forEach(r, function(e) {
								t("Array", e) || (i = {})
							}) : i = {}, t("Array", i) || (i._keys = []), t("Array", n) ? e.forEach(n, function(e) {
								i._keys && i._keys.push(o), i[o] = e, o++
							}) : (s = n._keys || Object.keys(n), e.forEach(s, function(e) {
								i[e] = n[e], i._keys.push(e);
								var t = parseInt(e, 10);
								!isNaN(t) && t >= o && (o = t + 1)
							})), e.forEach(r, function(n) {
								t("Array", n) ? e.forEach(n, function(e) {
									i._keys && i._keys.push(o), i[o] = e, o++
								}) : (s = n._keys || Object.keys(n), e.forEach(s, function(e) {
									i[e] || i._keys.push(e), i[e] = n[e];
									var t = parseInt(e, 10);
									!isNaN(t) && t >= o && (o = t + 1)
								}))
							}), 0 === r.length) throw new e.Error("Filter merge expects at least one parameter");
						return i
					},
					date: function(t, n) {
						var r = e.functions.date(t),
							i = n && n.length ? n[0] : "F j, Y H:i";
						return e.lib.date(i, r)
					},
					date_modify: function(t, n) {
						if (void 0 !== t && null !== t) {
							if (void 0 === n || 1 !== n.length) throw new e.Error("date_modify filter expects 1 argument");
							var r, i = n[0];
							return e.lib.is("Date", t) && (r = e.lib.strtotime(i, t.getTime() / 1e3)), e.lib.is("String", t) && (r = e.lib.strtotime(i, e.lib.strtotime(t))), e.lib.is("Number", t) && (r = e.lib.strtotime(i, t)), new Date(1e3 * r)
						}
					},
					replace: function(t, n) {
						if (void 0 !== t && null !== t) {
							var r, i = n[0];
							for (r in i) i.hasOwnProperty(r) && "_keys" !== r && (t = e.lib.replaceAll(t, r, i[r]));
							return t
						}
					},
					format: function(t, n) {
						if (void 0 !== t && null !== t) return e.lib.vsprintf(t, n)
					},
					striptags: function(t) {
						if (void 0 !== t && null !== t) return e.lib.strip_tags(t)
					},
					escape: function(t, n) {
						if (void 0 !== t && null !== t) {
							var r = "html";
							if (n && n.length && n[0] !== !0 && (r = n[0]), "html" == r) {
								var i = t.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
								return e.Markup(i, "html")
							}
							if ("js" == r) {
								for (var i = t.toString(), o = "", s = 0; s < i.length; s++)
									if (i[s].match(/^[a-zA-Z0-9,\._]$/)) o += i[s];
									else {
										var a = i.charCodeAt(s);
										o += a < 128 ? "\\x" + a.toString(16).toUpperCase() : e.lib.sprintf("\\u%04s", a.toString(16).toUpperCase())
									}
								return e.Markup(o, "js")
							}
							if ("css" == r) {
								for (var i = t.toString(), o = "", s = 0; s < i.length; s++)
									if (i[s].match(/^[a-zA-Z0-9]$/)) o += i[s];
									else {
										var a = i.charCodeAt(s);
										o += "\\" + a.toString(16).toUpperCase() + " "
									}
								return e.Markup(o, "css")
							}
							if ("url" == r) {
								var o = e.filters.url_encode(t);
								return e.Markup(o, "url")
							}
							if ("html_attr" == r) {
								for (var i = t.toString(), o = "", s = 0; s < i.length; s++)
									if (i[s].match(/^[a-zA-Z0-9,\.\-_]$/)) o += i[s];
									else if (i[s].match(/^[&<>"]$/)) o += i[s].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
								else {
									var a = i.charCodeAt(s);
									o += a <= 31 && 9 != a && 10 != a && 13 != a ? "&#xFFFD;" : a < 128 ? e.lib.sprintf("&#x%02s;", a.toString(16).toUpperCase()) : e.lib.sprintf("&#x%04s;", a.toString(16).toUpperCase())
								}
								return e.Markup(o, "html_attr")
							}
							throw new e.Error("escape strategy unsupported")
						}
					},
					e: function(t, n) {
						return e.filters.escape(t, n)
					},
					nl2br: function(t) {
						if (void 0 !== t && null !== t) {
							var n = "BACKSLASH_n_replace",
								r = "<br />" + n;
							return t = e.filters.escape(t).replace(/\r\n/g, r).replace(/\r/g, r).replace(/\n/g, r), t = e.lib.replaceAll(t, n, "\n"), e.Markup(t)
						}
					},
					number_format: function(e, t) {
						var n = e,
							r = t && t[0] ? t[0] : void 0,
							i = t && void 0 !== t[1] ? t[1] : ".",
							o = t && void 0 !== t[2] ? t[2] : ",";
						n = (n + "").replace(/[^0-9+\-Ee.]/g, "");
						var s = isFinite(+n) ? +n : 0,
							a = isFinite(+r) ? Math.abs(r) : 0,
							u = "",
							l = function(e, t) {
								var n = Math.pow(10, t);
								return "" + Math.round(e * n) / n
							};
						return u = (a ? l(s, a) : "" + Math.round(s)).split("."), u[0].length > 3 && (u[0] = u[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, o)), (u[1] || "").length < a && (u[1] = u[1] || "", u[1] += new Array(a - u[1].length + 1).join("0")), u.join(i)
					},
					trim: function(t, n) {
						if (void 0 !== t && null !== t) {
							var r, i = e.filters.escape("" + t);
							r = n && n[0] ? "" + n[0] : " \n\r\t\f\v�            ​\u2028\u2029　";
							for (var o = 0; o < i.length; o++)
								if (r.indexOf(i.charAt(o)) === -1) {
									i = i.substring(o);
									break
								}
							for (o = i.length - 1; o >= 0; o--)
								if (r.indexOf(i.charAt(o)) === -1) {
									i = i.substring(0, o + 1);
									break
								}
							return r.indexOf(i.charAt(0)) === -1 ? i : ""
						}
					},
					truncate: function(e, t) {
						var n = 30,
							r = !1,
							i = "...";
						if (e += "", t && (t[0] && (n = t[0]), t[1] && (r = t[1]), t[2] && (i = t[2])), e.length > n) {
							if (r && (n = e.indexOf(" ", n), n === -1)) return e;
							e = e.substr(0, n) + i
						}
						return e
					},
					slice: function(t, n) {
						if (void 0 !== t && null !== t) {
							if (void 0 === n || n.length < 1) throw new e.Error("slice filter expects at least 1 argument");
							var r = n[0] || 0,
								i = n.length > 1 ? n[1] : t.length,
								o = r >= 0 ? r : Math.max(t.length + r, 0);
							if (e.lib.is("Array", t)) {
								for (var s = [], a = o; a < o + i && a < t.length; a++) s.push(t[a]);
								return s
							}
							if (e.lib.is("String", t)) return t.substr(o, i);
							throw new e.Error("slice filter expects value to be an array or string")
						}
					},
					abs: function(e) {
						if (void 0 !== e && null !== e) return Math.abs(e)
					},
					first: function(e) {
						if (t("Array", e)) return e[0];
						if (t("Object", e)) {
							if ("_keys" in e) return e[e._keys[0]]
						} else if ("string" == typeof e) return e.substr(0, 1)
					},
					split: function(t, n) {
						if (void 0 !== t && null !== t) {
							if (void 0 === n || n.length < 1 || n.length > 2) throw new e.Error("split filter expects 1 or 2 argument");
							if (e.lib.is("String", t)) {
								var r = n[0],
									i = n[1],
									o = t.split(r);
								if (void 0 === i) return o;
								if (i < 0) return t.split(r, o.length + i);
								var s = [];
								if ("" == r)
									for (; o.length > 0;) {
										for (var a = "", u = 0; u < i && o.length > 0; u++) a += o.shift();
										s.push(a)
									} else {
										for (var u = 0; u < i - 1 && o.length > 0; u++) s.push(o.shift());
										o.length > 0 && s.push(o.join(r))
									}
								return s
							}
							throw new e.Error("split filter expects value to be a string")
						}
					},
					last: function(t) {
						if (e.lib.is("Object", t)) {
							var n;
							return n = void 0 === t._keys ? Object.keys(t) : t._keys, t[n[n.length - 1]]
						}
						return t[t.length - 1]
					},
					raw: function(t) {
						return e.Markup(t)
					},
					batch: function(t, n) {
						var r, i, o, s = n.shift(),
							a = n.shift();
						if (!e.lib.is("Array", t)) throw new e.Error("batch filter expects items to be an array");
						if (!e.lib.is("Number", s)) throw new e.Error("batch filter expects size to be a number");
						if (s = Math.ceil(s), r = e.lib.chunkArray(t, s), a && t.length % s != 0) {
							for (i = r.pop(), o = s - i.length; o--;) i.push(a);
							r.push(i)
						}
						return r
					},
					round: function(t, n) {
						n = n || [];
						var r = n.length > 0 ? n[0] : 0,
							i = n.length > 1 ? n[1] : "common";
						if (t = parseFloat(t), r && !e.lib.is("Number", r)) throw new e.Error("round filter expects precision to be a number");
						if ("common" === i) return e.lib.round(t, r);
						if (!e.lib.is("Function", Math[i])) throw new e.Error("round filter expects method to be 'floor', 'ceil', or 'common'");
						return Math[i](t * Math.pow(10, r)) / Math.pow(10, r)
					}
				}, e.filter = function(t, n, r) {
					if (!e.filters[t]) throw "Unable to find filter " + t;
					return e.filters[t].apply(this, [n, r])
				}, e.filter.extend = function(t, n) {
					e.filters[t] = n
				}, e
			}
		}, function(e, t) {
			e.exports = function(t) {
				var n = 'Template "{name}" is not defined.';
				return t.functions = {
					range: function(e, t, n) {
						var r, i, o, s = [],
							a = n || 1,
							u = !1;
						if (isNaN(e) || isNaN(t) ? isNaN(e) && isNaN(t) ? (u = !0, r = e.charCodeAt(0), i = t.charCodeAt(0)) : (r = isNaN(e) ? 0 : e, i = isNaN(t) ? 0 : t) : (r = parseInt(e, 10), i = parseInt(t, 10)), o = !(r > i))
							for (; r <= i;) s.push(u ? String.fromCharCode(r) : r), r += a;
						else
							for (; r >= i;) s.push(u ? String.fromCharCode(r) : r), r -= a;
						return s
					},
					cycle: function(e, t) {
						var n = t % e.length;
						return e[n]
					},
					dump: function() {
						var e = "\n",
							n = "  ",
							r = 0,
							i = "",
							o = Array.prototype.slice.call(arguments),
							s = function(e) {
								for (var t = ""; e > 0;) e--, t += n;
								return t
							},
							a = function(t) {
								i += s(r), "object" == typeof t ? u(t) : "function" == typeof t ? i += "function()" + e : "string" == typeof t ? i += "string(" + t.length + ') "' + t + '"' + e : "number" == typeof t ? i += "number(" + t + ")" + e : "boolean" == typeof t && (i += "bool(" + t + ")" + e)
							},
							u = function(t) {
								var n;
								if (null === t) i += "NULL" + e;
								else if (void 0 === t) i += "undefined" + e;
								else if ("object" == typeof t) {
									i += s(r) + typeof t, r++, i += "(" + function(e) {
										var t, n = 0;
										for (t in e) e.hasOwnProperty(t) && n++;
										return n
									}(t) + ") {" + e;
									for (n in t) i += s(r) + "[" + n + "]=> " + e, a(t[n]);
									r--, i += s(r) + "}" + e
								} else a(t)
							};
						return 0 == o.length && o.push(this.context), t.forEach(o, function(e) {
							u(e)
						}), i
					},
					date: function(e, n) {
						var r;
						if (void 0 === e || null === e || "" === e) r = new Date;
						else if (t.lib.is("Date", e)) r = e;
						else if (t.lib.is("String", e)) r = e.match(/^[0-9]+$/) ? new Date(1e3 * e) : new Date(1e3 * t.lib.strtotime(e));
						else {
							if (!t.lib.is("Number", e)) throw new t.Error("Unable to parse date " + e);
							r = new Date(1e3 * e)
						}
						return r
					},
					block: function(e) {
						return this.originalBlockTokens[e] ? t.logic.parse.apply(this, [this.originalBlockTokens[e], this.context]).output : this.blocks[e]
					},
					parent: function() {
						return t.placeholders.parent
					},
					attribute: function(e, n, r) {
						return t.lib.is("Object", e) && e.hasOwnProperty(n) ? "function" == typeof e[n] ? e[n].apply(void 0, r) : e[n] : e[n] || void 0
					},
					max: function(e) {
						return t.lib.is("Object", e) ? (delete e._keys, t.lib.max(e)) : t.lib.max.apply(null, arguments)
					},
					min: function(e) {
						return t.lib.is("Object", e) ? (delete e._keys, t.lib.min(e)) : t.lib.min.apply(null, arguments)
					},
					template_from_string: function(e) {
						return void 0 === e && (e = ""), t.Templates.parsers.twig({
							options: this.options,
							data: e
						})
					},
					random: function(e) {
						function n(e) {
							var t = Math.floor(Math.random() * r),
								n = [0, e],
								i = Math.min.apply(null, n),
								o = Math.max.apply(null, n);
							return i + Math.floor((o - i + 1) * t / r)
						}
						var r = 2147483648;
						if (t.lib.is("Number", e)) return n(e);
						if (t.lib.is("String", e)) return e.charAt(n(e.length - 1));
						if (t.lib.is("Array", e)) return e[n(e.length - 1)];
						if (t.lib.is("Object", e)) {
							var i = Object.keys(e);
							return e[i[n(i.length - 1)]]
						}
						return n(r - 1)
					},
					source: function(r, i) {
						var o, s, a, u = !1,
							l = "undefined" != typeof e && "undefined" != typeof e.exports && "undefined" == typeof window;
						l ? (s = "fs", a = __dirname + "/" + r) : (s = "ajax", a = r);
						var c = {
							id: r,
							path: a,
							method: s,
							parser: "source",
							async: !1,
							fetchTemplateSource: !0
						};
						"undefined" == typeof i && (i = !1);
						try {
							o = t.Templates.loadRemote(r, c), "undefined" == typeof o || null === o ? o = "" : u = !0
						} catch (e) {
							t.log.debug("Twig.functions.source: ", "Problem loading template  ", e)
						}
						return u || i ? o : n.replace("{name}", r)
					}
				}, t._function = function(e, n, r) {
					if (!t.functions[e]) throw "Unable to find function " + e;
					return t.functions[e](n, r)
				}, t._function.extend = function(e, n) {
					t.functions[e] = n
				}, t
			}
		}, function(e, t, n) {
			e.exports = function(e) {
				return e.lib = {}, e.lib.sprintf = n(8), e.lib.vsprintf = n(9), e.lib.round = n(10), e.lib.max = n(11), e.lib.min = n(12), e.lib.strip_tags = n(13), e.lib.strtotime = n(14), e.lib.date = n(15), e.lib.boolval = n(16), e.lib.is = function(e, t) {
					var n = Object.prototype.toString.call(t).slice(8, -1);
					return void 0 !== t && null !== t && n === e
				}, e.lib.copy = function(e) {
					var t, n = {};
					for (t in e) n[t] = e[t];
					return n
				}, e.lib.extend = function(e, t) {
					var n, r = Object.keys(t);
					for (n = r.length; n--;) e[r[n]] = t[r[n]];
					return e
				}, e.lib.replaceAll = function(e, t, n) {
					return e.split(t).join(n)
				}, e.lib.chunkArray = function(t, n) {
					var r = [],
						i = 0,
						o = t.length;
					if (n < 1 || !e.lib.is("Array", t)) return [];
					for (; i < o;) r.push(t.slice(i, i += n));
					return r
				}, e
			}
		}, function(e, t) {
			"use strict";
			e.exports = function() {
				var e = /%%|%(\d+\$)?([\-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,
					t = arguments,
					n = 0,
					r = t[n++],
					i = function(e, t, n, r) {
						n || (n = " ");
						var i = e.length >= t ? "" : new Array(1 + t - e.length >>> 0).join(n);
						return r ? e + i : i + e
					},
					o = function(e, t, n, r, o, s) {
						var a = r - e.length;
						return a > 0 && (e = n || !o ? i(e, r, s, n) : [e.slice(0, t.length), i("", a, "0", !0), e.slice(t.length)].join("")), e
					},
					s = function(e, t, n, r, s, a, u) {
						var l = e >>> 0;
						return n = n && l && {
							2: "0b",
							8: "0",
							16: "0x"
						}[t] || "", e = n + i(l.toString(t), a || 0, "0", !1), o(e, n, r, s, u)
					},
					a = function(e, t, n, r, i, s) {
						return null !== r && void 0 !== r && (e = e.slice(0, r)), o(e, "", t, n, i, s)
					},
					u = function(e, r, u, l, c, p) {
						var f, h, d, g, v;
						if ("%%" === e) return "%";
						var y, m = !1,
							b = "",
							x = !1,
							w = !1,
							_ = " ",
							k = u.length;
						for (y = 0; y < k; y++) switch (u.charAt(y)) {
							case " ":
								b = " ";
								break;
							case "+":
								b = "+";
								break;
							case "-":
								m = !0;
								break;
							case "'":
								_ = u.charAt(y + 1);
								break;
							case "0":
								x = !0, _ = "0";
								break;
							case "#":
								w = !0
						}
						if (l = l ? "*" === l ? +t[n++] : "*" === l.charAt(0) ? +t[l.slice(1, -1)] : +l : 0, l < 0 && (l = -l, m = !0), !isFinite(l)) throw new Error("sprintf: (minimum-)width must be finite");
						switch (c = c ? "*" === c ? +t[n++] : "*" === c.charAt(0) ? +t[c.slice(1, -1)] : +c : "fFeE".indexOf(p) > -1 ? 6 : "d" === p ? 0 : void 0, v = r ? t[r.slice(0, -1)] : t[n++], p) {
							case "s":
								return a(v + "", m, l, c, x, _);
							case "c":
								return a(String.fromCharCode(+v), m, l, c, x);
							case "b":
								return s(v, 2, w, m, l, c, x);
							case "o":
								return s(v, 8, w, m, l, c, x);
							case "x":
								return s(v, 16, w, m, l, c, x);
							case "X":
								return s(v, 16, w, m, l, c, x).toUpperCase();
							case "u":
								return s(v, 10, w, m, l, c, x);
							case "i":
							case "d":
								return f = +v || 0, f = Math.round(f - f % 1), h = f < 0 ? "-" : b, v = h + i(String(Math.abs(f)), c, "0", !1), o(v, h, m, l, x);
							case "e":
							case "E":
							case "f":
							case "F":
							case "g":
							case "G":
								return f = +v, h = f < 0 ? "-" : b, d = ["toExponential", "toFixed", "toPrecision"]["efg".indexOf(p.toLowerCase())], g = ["toString", "toUpperCase"]["eEfFgG".indexOf(p) % 2], v = h + Math.abs(f)[d](c), o(v, h, m, l, x)[g]();
							default:
								return e
						}
					};
				return r.replace(e, u)
			}
		}, function(e, t, n) {
			"use strict";
			e.exports = function(e, t) {
				var r = n(8);
				return r.apply(this, [e].concat(t))
			}
		}, function(e, t) {
			"use strict";
			e.exports = function(e, t, n) {
				var r, i, o, s;
				if (t |= 0, r = Math.pow(10, t), e *= r, s = e > 0 | -(e < 0), o = e % 1 === .5 * s, i = Math.floor(e), o) switch (n) {
					case "PHP_ROUND_HALF_DOWN":
						e = i + (s < 0);
						break;
					case "PHP_ROUND_HALF_EVEN":
						e = i + i % 2 * s;
						break;
					case "PHP_ROUND_HALF_ODD":
						e = i + !(i % 2);
						break;
					default:
						e = i + (s > 0)
				}
				return (o ? e : Math.round(e)) / r
			}
		}, function(e, t) {
			"use strict";
			var n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
				return typeof e
			} : function(e) {
				return e && "function" == typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
			};
			e.exports = function() {
				var e, t, r = 0,
					i = 0,
					o = arguments,
					s = o.length,
					a = function(e) {
						if ("[object Array]" === Object.prototype.toString.call(e)) return e;
						var t = [];
						for (var n in e) e.hasOwnProperty(n) && t.push(e[n]);
						return t
					},
					u = function e(t, r) {
						var i = 0,
							o = 0,
							s = 0,
							u = 0,
							l = 0;
						if (t === r) return 0;
						if ("object" === ("undefined" == typeof t ? "undefined" : n(t))) {
							if ("object" === ("undefined" == typeof r ? "undefined" : n(r))) {
								if (t = a(t), r = a(r), l = t.length, u = r.length, u > l) return 1;
								if (u < l) return -1;
								for (i = 0, o = l; i < o; ++i) {
									if (s = e(t[i], r[i]), 1 === s) return 1;
									if (s === -1) return -1
								}
								return 0
							}
							return -1
						}
						return "object" === ("undefined" == typeof r ? "undefined" : n(r)) ? 1 : isNaN(r) && !isNaN(t) ? 0 === t ? 0 : t < 0 ? 1 : -1 : isNaN(t) && !isNaN(r) ? 0 === r ? 0 : r > 0 ? 1 : -1 : r === t ? 0 : r > t ? 1 : -1
					};
				if (0 === s) throw new Error("At least one value should be passed to max()");
				if (1 === s) {
					if ("object" !== n(o[0])) throw new Error("Wrong parameter count for max()");
					if (e = a(o[0]), 0 === e.length) throw new Error("Array must contain at least one element for max()")
				} else e = o;
				for (t = e[0], r = 1, i = e.length; r < i; ++r) 1 === u(t, e[r]) && (t = e[r]);
				return t
			}
		}, function(e, t) {
			"use strict";
			var n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
				return typeof e
			} : function(e) {
				return e && "function" == typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
			};
			e.exports = function() {
				var e, t, r = 0,
					i = 0,
					o = arguments,
					s = o.length,
					a = function(e) {
						if ("[object Array]" === Object.prototype.toString.call(e)) return e;
						var t = [];
						for (var n in e) e.hasOwnProperty(n) && t.push(e[n]);
						return t
					},
					u = function e(t, r) {
						var i = 0,
							o = 0,
							s = 0,
							u = 0,
							l = 0;
						if (t === r) return 0;
						if ("object" === ("undefined" == typeof t ? "undefined" : n(t))) {
							if ("object" === ("undefined" == typeof r ? "undefined" : n(r))) {
								if (t = a(t), r = a(r), l = t.length, u = r.length, u > l) return 1;
								if (u < l) return -1;
								for (i = 0, o = l; i < o; ++i) {
									if (s = e(t[i], r[i]), 1 === s) return 1;
									if (s === -1) return -1
								}
								return 0
							}
							return -1
						}
						return "object" === ("undefined" == typeof r ? "undefined" : n(r)) ? 1 : isNaN(r) && !isNaN(t) ? 0 === t ? 0 : t < 0 ? 1 : -1 : isNaN(t) && !isNaN(r) ? 0 === r ? 0 : r > 0 ? 1 : -1 : r === t ? 0 : r > t ? 1 : -1
					};
				if (0 === s) throw new Error("At least one value should be passed to min()");
				if (1 === s) {
					if ("object" !== n(o[0])) throw new Error("Wrong parameter count for min()");
					if (e = a(o[0]), 0 === e.length) throw new Error("Array must contain at least one element for min()")
				} else e = o;
				for (t = e[0], r = 1, i = e.length; r < i; ++r) u(t, e[r]) === -1 && (t = e[r]);
				return t
			}
		}, function(e, t) {
			"use strict";
			e.exports = function(e, t) {
				t = (((t || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");
				var n = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
					r = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
				return e.replace(r, "").replace(n, function(e, n) {
					return t.indexOf("<" + n.toLowerCase() + ">") > -1 ? e : ""
				})
			}
		}, function(e, t) {
			"use strict";
			e.exports = function(e, t) {
				function n(e, t, n) {
					var r, i = l[t];
					"undefined" != typeof i && (r = i - u.getDay(), 0 === r ? r = 7 * n : r > 0 && "last" === e ? r -= 7 : r < 0 && "next" === e && (r += 7), u.setDate(u.getDate() + r))
				}

				function r(e) {
					var t = e.split(" "),
						r = t[0],
						i = t[1].substring(0, 3),
						o = /\d+/.test(r),
						s = "ago" === t[2],
						a = ("last" === r ? -1 : 1) * (s ? -1 : 1);
					if (o && (a *= parseInt(r, 10)), c.hasOwnProperty(i) && !t[1].match(/^mon(day|\.)?$/i)) return u["set" + c[i]](u["get" + c[i]]() + a);
					if ("wee" === i) return u.setDate(u.getDate() + 7 * a);
					if ("next" === r || "last" === r) n(r, i, a);
					else if (!o) return !1;
					return !0
				}
				var i, o, s, a, u, l, c, p, f, h, d, g = !1;
				if (!e) return g;
				e = e.replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " ").replace(/[\t\r\n]/g, "").toLowerCase();
				var v = new RegExp(["^(\\d{1,4})", "([\\-\\.\\/:])", "(\\d{1,2})", "([\\-\\.\\/:])", "(\\d{1,4})", "(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?", "(?:\\s([A-Z]+)?)?$"].join(""));
				if (o = e.match(v), o && o[2] === o[4])
					if (o[1] > 1901) switch (o[2]) {
						case "-":
							return o[3] > 12 || o[5] > 31 ? g : new Date(o[1], parseInt(o[3], 10) - 1, o[5], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3;
						case ".":
							return g;
						case "/":
							return o[3] > 12 || o[5] > 31 ? g : new Date(o[1], parseInt(o[3], 10) - 1, o[5], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3
					} else if (o[5] > 1901) switch (o[2]) {
						case "-":
							return o[3] > 12 || o[1] > 31 ? g : new Date(o[5], parseInt(o[3], 10) - 1, o[1], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3;
						case ".":
							return o[3] > 12 || o[1] > 31 ? g : new Date(o[5], parseInt(o[3], 10) - 1, o[1], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3;
						case "/":
							return o[1] > 12 || o[3] > 31 ? g : new Date(o[5], parseInt(o[1], 10) - 1, o[3], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3
					} else switch (o[2]) {
						case "-":
							return o[3] > 12 || o[5] > 31 || o[1] < 70 && o[1] > 38 ? g : (a = o[1] >= 0 && o[1] <= 38 ? +o[1] + 2e3 : o[1], new Date(a, parseInt(o[3], 10) - 1, o[5], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3);
						case ".":
							return o[5] >= 70 ? o[3] > 12 || o[1] > 31 ? g : new Date(o[5], parseInt(o[3], 10) - 1, o[1], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3 : o[5] < 60 && !o[6] ? o[1] > 23 || o[3] > 59 ? g : (s = new Date, new Date(s.getFullYear(), s.getMonth(), s.getDate(), o[1] || 0, o[3] || 0, o[5] || 0, o[9] || 0) / 1e3) : g;
						case "/":
							return o[1] > 12 || o[3] > 31 || o[5] < 70 && o[5] > 38 ? g : (a = o[5] >= 0 && o[5] <= 38 ? +o[5] + 2e3 : o[5], new Date(a, parseInt(o[1], 10) - 1, o[3], o[6] || 0, o[7] || 0, o[8] || 0, o[9] || 0) / 1e3);
						case ":":
							return o[1] > 23 || o[3] > 59 || o[5] > 59 ? g : (s = new Date, new Date(s.getFullYear(), s.getMonth(), s.getDate(), o[1] || 0, o[3] || 0, o[5] || 0) / 1e3)
					}
				if ("now" === e) return null === t || isNaN(t) ? (new Date).getTime() / 1e3 | 0 : 0 | t;
				if (!isNaN(i = Date.parse(e))) return i / 1e3 | 0;
				if (v = new RegExp(["^([0-9]{4}-[0-9]{2}-[0-9]{2})", "[ t]", "([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)", "([\\+-][0-9]{2}(:[0-9]{2})?|z)"].join("")), o = e.match(v), o && ("z" === o[4] ? o[4] = "Z" : o[4].match(/^([\+-][0-9]{2})$/) && (o[4] = o[4] + ":00"), !isNaN(i = Date.parse(o[1] + "T" + o[2] + o[4])))) return i / 1e3 | 0;
				if (u = t ? new Date(1e3 * t) : new Date, l = {
						sun: 0,
						mon: 1,
						tue: 2,
						wed: 3,
						thu: 4,
						fri: 5,
						sat: 6
					}, c = {
						yea: "FullYear",
						mon: "Month",
						day: "Date",
						hou: "Hours",
						min: "Minutes",
						sec: "Seconds"
					}, f = "(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)", h = "([+-]?\\d+\\s" + f + "|(last|next)\\s" + f + ")(\\sago)?", o = e.match(new RegExp(h, "gi")), !o) return g;
				for (d = 0, p = o.length; d < p; d++)
					if (!r(o[d])) return g;
				return u.getTime() / 1e3
			}
		}, function(e, t) {
			"use strict";
			e.exports = function(e, t) {
				var n, r, i = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
					o = /\\?(.?)/gi,
					s = function(e, t) {
						return r[e] ? r[e]() : t
					},
					a = function(e, t) {
						for (e = String(e); e.length < t;) e = "0" + e;
						return e
					};
				r = {
					d: function() {
						return a(r.j(), 2)
					},
					D: function() {
						return r.l().slice(0, 3)
					},
					j: function() {
						return n.getDate()
					},
					l: function() {
						return i[r.w()] + "day"
					},
					N: function() {
						return r.w() || 7
					},
					S: function() {
						var e = r.j(),
							t = e % 10;
						return t <= 3 && 1 === parseInt(e % 100 / 10, 10) && (t = 0), ["st", "nd", "rd"][t - 1] || "th"
					},
					w: function() {
						return n.getDay()
					},
					z: function() {
						var e = new Date(r.Y(), r.n() - 1, r.j()),
							t = new Date(r.Y(), 0, 1);
						return Math.round((e - t) / 864e5)
					},
					W: function() {
						var e = new Date(r.Y(), r.n() - 1, r.j() - r.N() + 3),
							t = new Date(e.getFullYear(), 0, 4);
						return a(1 + Math.round((e - t) / 864e5 / 7), 2)
					},
					F: function() {
						return i[6 + r.n()]
					},
					m: function() {
						return a(r.n(), 2)
					},
					M: function() {
						return r.F().slice(0, 3)
					},
					n: function() {
						return n.getMonth() + 1
					},
					t: function() {
						return new Date(r.Y(), r.n(), 0).getDate()
					},
					L: function() {
						var e = r.Y();
						return e % 4 === 0 & e % 100 !== 0 | e % 400 === 0
					},
					o: function() {
						var e = r.n(),
							t = r.W(),
							n = r.Y();
						return n + (12 === e && t < 9 ? 1 : 1 === e && t > 9 ? -1 : 0)
					},
					Y: function() {
						return n.getFullYear()
					},
					y: function() {
						return r.Y().toString().slice(-2)
					},
					a: function() {
						return n.getHours() > 11 ? "pm" : "am"
					},
					A: function() {
						return r.a().toUpperCase()
					},
					B: function() {
						var e = 3600 * n.getUTCHours(),
							t = 60 * n.getUTCMinutes(),
							r = n.getUTCSeconds();
						return a(Math.floor((e + t + r + 3600) / 86.4) % 1e3, 3)
					},
					g: function() {
						return r.G() % 12 || 12
					},
					G: function() {
						return n.getHours()
					},
					h: function() {
						return a(r.g(), 2)
					},
					H: function() {
						return a(r.G(), 2)
					},
					i: function() {
						return a(n.getMinutes(), 2)
					},
					s: function() {
						return a(n.getSeconds(), 2)
					},
					u: function() {
						return a(1e3 * n.getMilliseconds(), 6)
					},
					e: function() {
						var e = "Not supported (see source code of date() for timezone on how to add support)";
						throw new Error(e)
					},
					I: function() {
						var e = new Date(r.Y(), 0),
							t = Date.UTC(r.Y(), 0),
							n = new Date(r.Y(), 6),
							i = Date.UTC(r.Y(), 6);
						return e - t !== n - i ? 1 : 0
					},
					O: function() {
						var e = n.getTimezoneOffset(),
							t = Math.abs(e);
						return (e > 0 ? "-" : "+") + a(100 * Math.floor(t / 60) + t % 60, 4)
					},
					P: function() {
						var e = r.O();
						return e.substr(0, 3) + ":" + e.substr(3, 2)
					},
					T: function() {
						return "UTC"
					},
					Z: function() {
						return 60 * -n.getTimezoneOffset()
					},
					c: function() {
						return "Y-m-d\\TH:i:sP".replace(o, s)
					},
					r: function() {
						return "D, d M Y H:i:s O".replace(o, s)
					},
					U: function() {
						return n / 1e3 | 0
					}
				};
				var u = function(e, t) {
					return n = void 0 === t ? new Date : t instanceof Date ? new Date(t) : new Date(1e3 * t), e.replace(o, s)
				};
				return u(e, t)
			}
		}, function(e, t) {
			"use strict";
			e.exports = function(e) {
				return e !== !1 && 0 !== e && 0 !== e && "" !== e && "0" !== e && (!Array.isArray(e) || 0 !== e.length) && null !== e && void 0 !== e
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				e.Templates.registerLoader("ajax", function(t, n, r, i) {
					var o, s, a = n.precompiled,
						u = this.parsers[n.parser] || this.parser.twig;
					if ("undefined" == typeof XMLHttpRequest) throw new e.Error('Unsupported platform: Unable to do ajax requests because there is no "XMLHTTPRequest" implementation');
					return s = new XMLHttpRequest, s.onreadystatechange = function() {
						var l = null;
						4 === s.readyState && (200 === s.status || window.cordova && 0 == s.status ? (e.log.debug("Got template ", s.responseText), l = a === !0 ? JSON.parse(s.responseText) : s.responseText, n.url = t, n.data = l, o = u.call(this, n), "function" == typeof r && r(o)) : "function" == typeof i && i(s))
					}, s.open("GET", t, !!n.async), s.send(), !!n.async || o
				})
			}
		}, function(e, t, n) {
			e.exports = function(e) {
				"use strict";
				var t, r;
				try {
					t = n(19), r = n(20)
				} catch (e) {}
				e.Templates.registerLoader("fs", function(n, i, o, s) {
					var a, u = null,
						l = i.precompiled,
						c = this.parsers[i.parser] || this.parser.twig;
					if (!t || !r) throw new e.Error('Unsupported platform: Unable to load from file because there is no "fs" or "path" implementation');
					var p = function(e, t) {
						return e ? void("function" == typeof s && s(e)) : (l === !0 && (t = JSON.parse(t)),
							i.data = t, i.path = i.path || n, a = c.call(this, i), void("function" == typeof o && o(a)))
					};
					if (i.path = i.path || n, i.async) return t.stat(i.path, function(n, r) {
						if (n || !r.isFile()) throw new e.Error("Unable to find template file " + i.path);
						t.readFile(i.path, "utf8", p)
					}), !0;
					try {
						if (!t.statSync(i.path).isFile()) throw new e.Error("Unable to find template file " + i.path)
					} catch (t) {
						throw new e.Error("Unable to find template file " + i.path)
					}
					return u = t.readFileSync(i.path, "utf8"), p(void 0, u), a
				})
			}
		}, function(e, t) {}, function(e, t, n) {
			(function(e) {
				function n(e, t) {
					for (var n = 0, r = e.length - 1; r >= 0; r--) {
						var i = e[r];
						"." === i ? e.splice(r, 1) : ".." === i ? (e.splice(r, 1), n++) : n && (e.splice(r, 1), n--)
					}
					if (t)
						for (; n--; n) e.unshift("..");
					return e
				}

				function r(e, t) {
					if (e.filter) return e.filter(t);
					for (var n = [], r = 0; r < e.length; r++) t(e[r], r, e) && n.push(e[r]);
					return n
				}
				var i = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
					o = function(e) {
						return i.exec(e).slice(1)
					};
				t.resolve = function() {
					for (var t = "", i = !1, o = arguments.length - 1; o >= -1 && !i; o--) {
						var s = o >= 0 ? arguments[o] : e.cwd();
						if ("string" != typeof s) throw new TypeError("Arguments to path.resolve must be strings");
						s && (t = s + "/" + t, i = "/" === s.charAt(0))
					}
					return t = n(r(t.split("/"), function(e) {
						return !!e
					}), !i).join("/"), (i ? "/" : "") + t || "."
				}, t.normalize = function(e) {
					var i = t.isAbsolute(e),
						o = "/" === s(e, -1);
					return e = n(r(e.split("/"), function(e) {
						return !!e
					}), !i).join("/"), e || i || (e = "."), e && o && (e += "/"), (i ? "/" : "") + e
				}, t.isAbsolute = function(e) {
					return "/" === e.charAt(0)
				}, t.join = function() {
					var e = Array.prototype.slice.call(arguments, 0);
					return t.normalize(r(e, function(e, t) {
						if ("string" != typeof e) throw new TypeError("Arguments to path.join must be strings");
						return e
					}).join("/"))
				}, t.relative = function(e, n) {
					function r(e) {
						for (var t = 0; t < e.length && "" === e[t]; t++);
						for (var n = e.length - 1; n >= 0 && "" === e[n]; n--);
						return t > n ? [] : e.slice(t, n - t + 1)
					}
					e = t.resolve(e).substr(1), n = t.resolve(n).substr(1);
					for (var i = r(e.split("/")), o = r(n.split("/")), s = Math.min(i.length, o.length), a = s, u = 0; u < s; u++)
						if (i[u] !== o[u]) {
							a = u;
							break
						}
					for (var l = [], u = a; u < i.length; u++) l.push("..");
					return l = l.concat(o.slice(a)), l.join("/")
				}, t.sep = "/", t.delimiter = ":", t.dirname = function(e) {
					var t = o(e),
						n = t[0],
						r = t[1];
					return n || r ? (r && (r = r.substr(0, r.length - 1)), n + r) : "."
				}, t.basename = function(e, t) {
					var n = o(e)[2];
					return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)), n
				}, t.extname = function(e) {
					return o(e)[3]
				};
				var s = "b" === "ab".substr(-1) ? function(e, t, n) {
					return e.substr(t, n)
				} : function(e, t, n) {
					return t < 0 && (t = e.length + t), e.substr(t, n)
				}
			}).call(t, n(21))
		}, function(e, t) {
			function n() {
				throw new Error("setTimeout has not been defined")
			}

			function r() {
				throw new Error("clearTimeout has not been defined")
			}

			function i(e) {
				if (c === setTimeout) return setTimeout(e, 0);
				if ((c === n || !c) && setTimeout) return c = setTimeout, setTimeout(e, 0);
				try {
					return c(e, 0)
				} catch (t) {
					try {
						return c.call(null, e, 0)
					} catch (t) {
						return c.call(this, e, 0)
					}
				}
			}

			function o(e) {
				if (p === clearTimeout) return clearTimeout(e);
				if ((p === r || !p) && clearTimeout) return p = clearTimeout, clearTimeout(e);
				try {
					return p(e)
				} catch (t) {
					try {
						return p.call(null, e)
					} catch (t) {
						return p.call(this, e)
					}
				}
			}

			function s() {
				g && h && (g = !1, h.length ? d = h.concat(d) : v = -1, d.length && a())
			}

			function a() {
				if (!g) {
					var e = i(s);
					g = !0;
					for (var t = d.length; t;) {
						for (h = d, d = []; ++v < t;) h && h[v].run();
						v = -1, t = d.length
					}
					h = null, g = !1, o(e)
				}
			}

			function u(e, t) {
				this.fun = e, this.array = t
			}

			function l() {}
			var c, p, f = e.exports = {};
			! function() {
				try {
					c = "function" == typeof setTimeout ? setTimeout : n
				} catch (e) {
					c = n
				}
				try {
					p = "function" == typeof clearTimeout ? clearTimeout : r
				} catch (e) {
					p = r
				}
			}();
			var h, d = [],
				g = !1,
				v = -1;
			f.nextTick = function(e) {
				var t = new Array(arguments.length - 1);
				if (arguments.length > 1)
					for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
				d.push(new u(e, t)), 1 !== d.length || g || i(a)
			}, u.prototype.run = function() {
				this.fun.apply(null, this.array)
			}, f.title = "browser", f.browser = !0, f.env = {}, f.argv = [], f.version = "", f.versions = {}, f.on = l, f.addListener = l, f.once = l, f.off = l, f.removeListener = l, f.removeAllListeners = l, f.emit = l, f.binding = function(e) {
				throw new Error("process.binding is not supported")
			}, f.cwd = function() {
				return "/"
			}, f.chdir = function(e) {
				throw new Error("process.chdir is not supported")
			}, f.umask = function() {
				return 0
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				for (e.logic = {}, e.logic.type = {
						if_: "Twig.logic.type.if",
						endif: "Twig.logic.type.endif",
						for_: "Twig.logic.type.for",
						endfor: "Twig.logic.type.endfor",
						else_: "Twig.logic.type.else",
						elseif: "Twig.logic.type.elseif",
						set: "Twig.logic.type.set",
						setcapture: "Twig.logic.type.setcapture",
						endset: "Twig.logic.type.endset",
						filter: "Twig.logic.type.filter",
						endfilter: "Twig.logic.type.endfilter",
						shortblock: "Twig.logic.type.shortblock",
						block: "Twig.logic.type.block",
						endblock: "Twig.logic.type.endblock",
						extends_: "Twig.logic.type.extends",
						use: "Twig.logic.type.use",
						include: "Twig.logic.type.include",
						spaceless: "Twig.logic.type.spaceless",
						endspaceless: "Twig.logic.type.endspaceless",
						macro: "Twig.logic.type.macro",
						endmacro: "Twig.logic.type.endmacro",
						import_: "Twig.logic.type.import",
						from: "Twig.logic.type.from",
						embed: "Twig.logic.type.embed",
						endembed: "Twig.logic.type.endembed"
					}, e.logic.definitions = [{
						type: e.logic.type.if_,
						regex: /^if\s+([\s\S]+)$/,
						next: [e.logic.type.else_, e.logic.type.elseif, e.logic.type.endif],
						open: !0,
						compile: function(t) {
							var n = t.match[1];
							return t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, delete t.match, t
						},
						parse: function(t, n, r) {
							var i = "",
								o = e.expression.parse.apply(this, [t.stack, n]);
							return r = !0, e.lib.boolval(o) && (r = !1, i = e.parse.apply(this, [t.output, n])), {
								chain: r,
								output: i
							}
						}
					}, {
						type: e.logic.type.elseif,
						regex: /^elseif\s+([^\s].*)$/,
						next: [e.logic.type.else_, e.logic.type.elseif, e.logic.type.endif],
						open: !1,
						compile: function(t) {
							var n = t.match[1];
							return t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, delete t.match, t
						},
						parse: function(t, n, r) {
							var i = "",
								o = e.expression.parse.apply(this, [t.stack, n]);
							return r && e.lib.boolval(o) && (r = !1, i = e.parse.apply(this, [t.output, n])), {
								chain: r,
								output: i
							}
						}
					}, {
						type: e.logic.type.else_,
						regex: /^else$/,
						next: [e.logic.type.endif, e.logic.type.endfor],
						open: !1,
						parse: function(t, n, r) {
							var i = "";
							return r && (i = e.parse.apply(this, [t.output, n])), {
								chain: r,
								output: i
							}
						}
					}, {
						type: e.logic.type.endif,
						regex: /^endif$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.for_,
						regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].*?)(?:\s+if\s+([^\s].*))?$/,
						next: [e.logic.type.else_, e.logic.type.endfor],
						open: !0,
						compile: function(t) {
							var n = t.match[1],
								r = t.match[2],
								i = t.match[3],
								o = null;
							if (t.key_var = null, t.value_var = null, n.indexOf(",") >= 0) {
								if (o = n.split(","), 2 !== o.length) throw new e.Error("Invalid expression in for loop: " + n);
								t.key_var = o[0].trim(), t.value_var = o[1].trim()
							} else t.value_var = n;
							return t.expression = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: r
							}]).stack, i && (t.conditional = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: i
							}]).stack), delete t.match, t
						},
						parse: function(t, n, r) {
							var i, o, s = e.expression.parse.apply(this, [t.expression, n]),
								a = [],
								u = 0,
								l = this,
								c = t.conditional,
								p = function(e, t) {
									var r = void 0 !== c;
									return {
										index: e + 1,
										index0: e,
										revindex: r ? void 0 : t - e,
										revindex0: r ? void 0 : t - e - 1,
										first: 0 === e,
										last: r ? void 0 : e === t - 1,
										length: r ? void 0 : t,
										parent: n
									}
								},
								f = function(r, o) {
									var s = e.ChildContext(n);
									s[t.value_var] = o, t.key_var && (s[t.key_var] = r), s.loop = p(u, i), (void 0 === c || e.expression.parse.apply(l, [c, s])) && (a.push(e.parse.apply(l, [t.output, s])), u += 1), delete s.loop, delete s[t.value_var], delete s[t.key_var], e.merge(n, s, !0)
								};
							return e.lib.is("Array", s) ? (i = s.length, e.forEach(s, function(e) {
								var t = u;
								f(t, e)
							})) : e.lib.is("Object", s) && (o = void 0 !== s._keys ? s._keys : Object.keys(s), i = o.length, e.forEach(o, function(e) {
								"_keys" !== e && f(e, s[e])
							})), r = 0 === a.length, {
								chain: r,
								output: e.output.apply(this, [a])
							}
						}
					}, {
						type: e.logic.type.endfor,
						regex: /^endfor$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.set,
						regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*([\s\S]+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							var n = t.match[1].trim(),
								r = t.match[2],
								i = e.expression.compile.apply(this, [{
									type: e.expression.type.expression,
									value: r
								}]).stack;
							return t.key = n, t.expression = i, delete t.match, t
						},
						parse: function(t, n, r) {
							var i = e.expression.parse.apply(this, [t.expression, n]),
								o = t.key;
							return i === n && (i = e.lib.copy(i)), n[o] = i, {
								chain: r,
								context: n
							}
						}
					}, {
						type: e.logic.type.setcapture,
						regex: /^set\s+([a-zA-Z0-9_,\s]+)$/,
						next: [e.logic.type.endset],
						open: !0,
						compile: function(e) {
							var t = e.match[1].trim();
							return e.key = t, delete e.match, e
						},
						parse: function(t, n, r) {
							var i = e.parse.apply(this, [t.output, n]),
								o = t.key;
							return this.context[o] = i, n[o] = i, {
								chain: r,
								context: n
							}
						}
					}, {
						type: e.logic.type.endset,
						regex: /^endset$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.filter,
						regex: /^filter\s+(.+)$/,
						next: [e.logic.type.endfilter],
						open: !0,
						compile: function(t) {
							var n = "|" + t.match[1].trim();
							return t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, delete t.match, t
						},
						parse: function(t, n, r) {
							var i = e.parse.apply(this, [t.output, n]),
								o = [{
									type: e.expression.type.string,
									value: i
								}].concat(t.stack),
								s = e.expression.parse.apply(this, [o, n]);
							return {
								chain: r,
								output: s
							}
						}
					}, {
						type: e.logic.type.endfilter,
						regex: /^endfilter$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.block,
						regex: /^block\s+([a-zA-Z0-9_]+)$/,
						next: [e.logic.type.endblock],
						open: !0,
						compile: function(e) {
							return e.block = e.match[1].trim(), delete e.match, e
						},
						parse: function(t, n, r) {
							var i, o, s = e.indexOf(this.importedBlocks, t.block) > -1,
								a = this.blocks[t.block] && e.indexOf(this.blocks[t.block], e.placeholders.parent) > -1;
							return (void 0 === this.blocks[t.block] || s || a || n.loop || t.overwrite) && (i = t.expression ? e.expression.parse.apply(this, [{
								type: e.expression.type.string,
								value: e.expression.parse.apply(this, [t.output, n])
							}, n]) : e.expression.parse.apply(this, [{
								type: e.expression.type.string,
								value: e.parse.apply(this, [t.output, n])
							}, n]), s && this.importedBlocks.splice(this.importedBlocks.indexOf(t.block), 1), a ? this.blocks[t.block] = e.Markup(this.blocks[t.block].replace(e.placeholders.parent, i)) : this.blocks[t.block] = i, this.originalBlockTokens[t.block] = {
								type: t.type,
								block: t.block,
								output: t.output,
								overwrite: !0
							}), o = this.child.blocks[t.block] ? this.child.blocks[t.block] : this.blocks[t.block], {
								chain: r,
								output: o
							}
						}
					}, {
						type: e.logic.type.shortblock,
						regex: /^block\s+([a-zA-Z0-9_]+)\s+(.+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							return t.expression = t.match[2].trim(), t.output = e.expression.compile({
								type: e.expression.type.expression,
								value: t.expression
							}).stack, t.block = t.match[1].trim(), delete t.match, t
						},
						parse: function(t, n, r) {
							return e.logic.handler[e.logic.type.block].parse.apply(this, arguments)
						}
					}, {
						type: e.logic.type.endblock,
						regex: /^endblock(?:\s+([a-zA-Z0-9_]+))?$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.extends_,
						regex: /^extends\s+(.+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							var n = t.match[1].trim();
							return delete t.match, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, t
						},
						parse: function(t, n, r) {
							var i, o = e.ChildContext(n),
								s = e.expression.parse.apply(this, [t.stack, n]);
							return this.extend = s, i = s instanceof e.Template ? s : this.importFile(s), i.render(o), e.lib.extend(n, o), {
								chain: r,
								output: ""
							}
						}
					}, {
						type: e.logic.type.use,
						regex: /^use\s+(.+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							var n = t.match[1].trim();
							return delete t.match, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, t
						},
						parse: function(t, n, r) {
							var i = e.expression.parse.apply(this, [t.stack, n]);
							return this.importBlocks(i), {
								chain: r,
								output: ""
							}
						}
					}, {
						type: e.logic.type.include,
						regex: /^include\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,
						next: [],
						open: !0,
						compile: function(t) {
							var n = t.match,
								r = n[1].trim(),
								i = void 0 !== n[2],
								o = n[3],
								s = void 0 !== n[4] && n[4].length;
							return delete t.match, t.only = s, t.ignoreMissing = i, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: r
							}]).stack, void 0 !== o && (t.withStack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: o.trim()
							}]).stack), t
						},
						parse: function(t, n, r) {
							var i, o, s, a = {};
							if (t.only || (a = e.ChildContext(n)), void 0 !== t.withStack) {
								i = e.expression.parse.apply(this, [t.withStack, n]);
								for (o in i) i.hasOwnProperty(o) && (a[o] = i[o])
							}
							var u = e.expression.parse.apply(this, [t.stack, n]);
							if (u instanceof e.Template) s = u;
							else try {
								s = this.importFile(u)
							} catch (e) {
								if (t.ignoreMissing) return {
									chain: r,
									output: ""
								};
								throw e
							}
							return {
								chain: r,
								output: s.render(a)
							}
						}
					}, {
						type: e.logic.type.spaceless,
						regex: /^spaceless$/,
						next: [e.logic.type.endspaceless],
						open: !0,
						parse: function(t, n, r) {
							var i = e.parse.apply(this, [t.output, n]),
								o = />\s+</g,
								s = i.replace(o, "><").trim();
							return {
								chain: r,
								output: s
							}
						}
					}, {
						type: e.logic.type.endspaceless,
						regex: /^endspaceless$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.macro,
						regex: /^macro\s+([a-zA-Z0-9_]+)\s*\(\s*((?:[a-zA-Z0-9_]+(?:,\s*)?)*)\s*\)$/,
						next: [e.logic.type.endmacro],
						open: !0,
						compile: function(t) {
							for (var n = t.match[1], r = t.match[2].split(/[\s,]+/), i = 0; i < r.length; i++)
								for (var o = 0; o < r.length; o++)
									if (r[i] === r[o] && i !== o) throw new e.Error("Duplicate arguments for parameter: " + r[i]);
							return t.macroName = n, t.parameters = r, delete t.match, t
						},
						parse: function(t, n, r) {
							var i = this;
							return this.macros[t.macroName] = function() {
								for (var n = {
										_self: i.macros
									}, r = 0; r < t.parameters.length; r++) {
									var o = t.parameters[r];
									"undefined" != typeof arguments[r] ? n[o] = arguments[r] : n[o] = void 0
								}
								return e.parse.apply(i, [t.output, n])
							}, {
								chain: r,
								output: ""
							}
						}
					}, {
						type: e.logic.type.endmacro,
						regex: /^endmacro$/,
						next: [],
						open: !1
					}, {
						type: e.logic.type.import_,
						regex: /^import\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							var n = t.match[1].trim(),
								r = t.match[2].trim();
							return delete t.match, t.expression = n, t.contextName = r, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, t
						},
						parse: function(t, n, r) {
							if ("_self" !== t.expression) {
								var i = e.expression.parse.apply(this, [t.stack, n]),
									o = this.importFile(i || t.expression);
								n[t.contextName] = o.render({}, {
									output: "macros"
								})
							} else n[t.contextName] = this.macros;
							return {
								chain: r,
								output: ""
							}
						}
					}, {
						type: e.logic.type.from,
						regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
						next: [],
						open: !0,
						compile: function(t) {
							for (var n = t.match[1].trim(), r = t.match[2].trim().split(/[ ,]+/), i = {}, o = 0; o < r.length; o++) {
								var s = r[o],
									a = s.match(/^([a-zA-Z0-9_]+)\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/);
								a ? i[a[1].trim()] = a[2].trim() : s.match(/^([a-zA-Z0-9_]+)$/) && (i[s] = s)
							}
							return delete t.match, t.expression = n, t.macroNames = i, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: n
							}]).stack, t
						},
						parse: function(t, n, r) {
							var i;
							if ("_self" !== t.expression) {
								var o = e.expression.parse.apply(this, [t.stack, n]),
									s = this.importFile(o || t.expression);
								i = s.render({}, {
									output: "macros"
								})
							} else i = this.macros;
							for (var a in t.macroNames) i.hasOwnProperty(a) && (n[t.macroNames[a]] = i[a]);
							return {
								chain: r,
								output: ""
							}
						}
					}, {
						type: e.logic.type.embed,
						regex: /^embed\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,
						next: [e.logic.type.endembed],
						open: !0,
						compile: function(t) {
							var n = t.match,
								r = n[1].trim(),
								i = void 0 !== n[2],
								o = n[3],
								s = void 0 !== n[4] && n[4].length;
							return delete t.match, t.only = s, t.ignoreMissing = i, t.stack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: r
							}]).stack, void 0 !== o && (t.withStack = e.expression.compile.apply(this, [{
								type: e.expression.type.expression,
								value: o.trim()
							}]).stack), t
						},
						parse: function(t, n, r) {
							var i, o, s, a = {};
							if (!t.only)
								for (o in n) n.hasOwnProperty(o) && (a[o] = n[o]);
							if (void 0 !== t.withStack) {
								i = e.expression.parse.apply(this, [t.withStack, n]);
								for (o in i) i.hasOwnProperty(o) && (a[o] = i[o])
							}
							var u = e.expression.parse.apply(this, [t.stack, a]);
							if (u instanceof e.Template) s = u;
							else try {
								s = this.importFile(u)
							} catch (e) {
								if (t.ignoreMissing) return {
									chain: r,
									output: ""
								};
								throw e
							}
							return this.blocks = {}, e.parse.apply(this, [t.output, a]), {
								chain: r,
								output: s.render(a, {
									blocks: this.blocks
								})
							}
						}
					}, {
						type: e.logic.type.endembed,
						regex: /^endembed$/,
						next: [],
						open: !1
					}], e.logic.handler = {}, e.logic.extendType = function(t, n) {
						n = n || "Twig.logic.type" + t, e.logic.type[t] = n
					}, e.logic.extend = function(t) {
						if (!t.type) throw new e.Error("Unable to extend logic definition. No type provided for " + t);
						e.logic.extendType(t.type), e.logic.handler[t.type] = t
					}; e.logic.definitions.length > 0;) e.logic.extend(e.logic.definitions.shift());
				return e.logic.compile = function(t) {
					var n = t.value.trim(),
						r = e.logic.tokenize.apply(this, [n]),
						i = e.logic.handler[r.type];
					return i.compile && (r = i.compile.apply(this, [r]), e.log.trace("Twig.logic.compile: ", "Compiled logic token to ", r)), r
				}, e.logic.tokenize = function(t) {
					var n = {},
						r = null,
						i = null,
						o = null,
						s = null,
						a = null,
						u = null;
					t = t.trim();
					for (r in e.logic.handler)
						if (e.logic.handler.hasOwnProperty(r))
							for (i = e.logic.handler[r].type, o = e.logic.handler[r].regex, s = [], o instanceof Array ? s = o : s.push(o); s.length > 0;)
								if (a = s.shift(), u = a.exec(t.trim()), null !== u) return n.type = i, n.match = u, e.log.trace("Twig.logic.tokenize: ", "Matched a ", i, " regular expression of ", u), n;
					throw new e.Error("Unable to parse '" + t.trim() + "'")
				}, e.logic.parse = function(t, n, r) {
					var i, o = "";
					return n = n || {}, e.log.debug("Twig.logic.parse: ", "Parsing logic token ", t), i = e.logic.handler[t.type], i.parse && (o = i.parse.apply(this, [t, n, r])), o
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				e.Templates.registerParser("source", function(e) {
					return e.data || ""
				})
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				e.Templates.registerParser("twig", function(t) {
					return new e.Template(t)
				})
			}
		}, function(e, t, n) {
			e.exports = function(e) {
				"use strict";
				return e.path = {}, e.path.parsePath = function(t, n) {
					var r = null,
						n = n || "";
					if ("object" == typeof t && "object" == typeof t.options && (r = t.options.namespaces), "object" == typeof r && n.indexOf("::") > 0 || n.indexOf("@") >= 0) {
						for (var i in r) r.hasOwnProperty(i) && (n = n.replace(i + "::", r[i]), n = n.replace("@" + i, r[i]));
						return n
					}
					return e.path.relativePath(t, n)
				}, e.path.relativePath = function(t, r) {
					var i, o, s, a = "/",
						u = [],
						r = r || "";
					if (t.url) i = "undefined" != typeof t.base ? t.base + ("/" === t.base.charAt(t.base.length - 1) ? "" : "/") : t.url;
					else if (t.path) {
						var l = n(20),
							c = l.sep || a,
							p = new RegExp("^\\.{1,2}" + c.replace("\\", "\\\\"));
						r = r.replace(/\//g, c), void 0 !== t.base && null == r.match(p) ? (r = r.replace(t.base, ""), i = t.base + c) : i = l.normalize(t.path), i = i.replace(c + c, c), a = c
					} else {
						if (!t.name && !t.id || !t.method || "fs" === t.method || "ajax" === t.method) throw new e.Error("Cannot extend an inline template.");
						i = t.base || t.name || t.id
					}
					for (o = i.split(a), o.pop(), o = o.concat(r.split(a)); o.length > 0;) s = o.shift(), "." == s || (".." == s && u.length > 0 && ".." != u[u.length - 1] ? u.pop() : u.push(s));
					return u.join(a)
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				return e.tests = {
					empty: function(e) {
						if (null === e || void 0 === e) return !0;
						if ("number" == typeof e) return !1;
						if (e.length && e.length > 0) return !1;
						for (var t in e)
							if (e.hasOwnProperty(t)) return !1;
						return !0
					},
					odd: function(e) {
						return e % 2 === 1
					},
					even: function(e) {
						return e % 2 === 0
					},
					divisibleby: function(e, t) {
						return e % t[0] === 0
					},
					defined: function(e) {
						return void 0 !== e
					},
					none: function(e) {
						return null === e
					},
					null: function(e) {
						return this.none(e)
					},
					sameas: function(e, t) {
						return e === t[0]
					},
					iterable: function(t) {
						return t && (e.lib.is("Array", t) || e.lib.is("Object", t))
					}
				}, e.test = function(t, n, r) {
					if (!e.tests[t]) throw "Test " + t + " is not defined.";
					return e.tests[t](n, r)
				}, e.test.extend = function(t, n) {
					e.tests[t] = n
				}, e
			}
		}, function(e, t) {
			e.exports = function(e) {
				"use strict";
				return e.exports = {
					VERSION: e.VERSION
				}, e.exports.twig = function(t) {
					var n = t.id,
						r = {
							strict_variables: t.strict_variables || !1,
							autoescape: null != t.autoescape && t.autoescape || !1,
							allowInlineIncludes: t.allowInlineIncludes || !1,
							rethrow: t.rethrow || !1,
							namespaces: t.namespaces
						};
					if (e.cache && n && e.validateId(n), void 0 !== t.debug && (e.debug = t.debug), void 0 !== t.trace && (e.trace = t.trace), void 0 !== t.data) return e.Templates.parsers.twig({
						data: t.data,
						path: t.hasOwnProperty("path") ? t.path : void 0,
						module: t.module,
						id: n,
						options: r
					});
					if (void 0 !== t.ref) {
						if (void 0 !== t.id) throw new e.Error("Both ref and id cannot be set on a twig.js template.");
						return e.Templates.load(t.ref)
					}
					if (void 0 !== t.method) {
						if (!e.Templates.isRegisteredLoader(t.method)) throw new e.Error('Loader for "' + t.method + '" is not defined.');
						return e.Templates.loadRemote(t.name || t.href || t.path || n || void 0, {
							id: n,
							method: t.method,
							parser: t.parser || "twig",
							base: t.base,
							module: t.module,
							precompiled: t.precompiled,
							async: t.async,
							options: r
						}, t.load, t.error)
					}
					return void 0 !== t.href ? e.Templates.loadRemote(t.href, {
						id: n,
						method: "ajax",
						parser: t.parser || "twig",
						base: t.base,
						module: t.module,
						precompiled: t.precompiled,
						async: t.async,
						options: r
					}, t.load, t.error) : void 0 !== t.path ? e.Templates.loadRemote(t.path, {
						id: n,
						method: "fs",
						parser: t.parser || "twig",
						base: t.base,
						module: t.module,
						precompiled: t.precompiled,
						async: t.async,
						options: r
					}, t.load, t.error) : void 0
				}, e.exports.extendFilter = function(t, n) {
					e.filter.extend(t, n)
				}, e.exports.extendFunction = function(t, n) {
					e._function.extend(t, n)
				}, e.exports.extendTest = function(t, n) {
					e.test.extend(t, n)
				}, e.exports.extendTag = function(t) {
					e.logic.extend(t)
				}, e.exports.extend = function(t) {
					t(e)
				}, e.exports.compile = function(t, n) {
					var r, i = n.filename,
						o = n.filename;
					return r = new e.Template({
							data: t,
							path: o,
							id: i,
							options: n.settings["twig options"]
						}),
						function(e) {
							return r.render(e)
						}
				}, e.exports.renderFile = function(t, n, r) {
					"function" == typeof n && (r = n, n = {}), n = n || {};
					var i = n.settings || {},
						o = {
							path: t,
							base: i.views,
							load: function(e) {
								r(null, "" + e.render(n))
							}
						},
						s = i["twig options"];
					if (s)
						for (var a in s) s.hasOwnProperty(a) && (o[a] = s[a]);
					e.exports.twig(o)
				}, e.exports.__express = e.exports.renderFile, e.exports.cache = function(t) {
					e.cache = t
				}, e.exports.path = e.path, e.exports.filters = e.filters, e
			}
		}])
	}), define("templates/layout.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "layout.twig",
				allowInlineIncludes: !0,
				data: [{
					type: "raw",
					value: '<div class="content">\n\n</div>'
				}],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), function(e, t) {
		if ("function" == typeof define && define.amd) define("views/layout", ["exports", "backbone.marionette", "templates/layout.twig"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("templates/layout.twig"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.layout), e.layout = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var i = r(t),
			o = i.default.View.extend({
				template: n.render,
				el: ".container",
				regions: {
					content: ".content"
				}
			});
		e.default = new o
	}), function() {
		function e(e, t) {
			return e.set(t[0], t[1]), e
		}

		function t(e, t) {
			return e.add(t), e
		}

		function n(e, t, n) {
			switch (n.length) {
				case 0:
					return e.call(t);
				case 1:
					return e.call(t, n[0]);
				case 2:
					return e.call(t, n[0], n[1]);
				case 3:
					return e.call(t, n[0], n[1], n[2])
			}
			return e.apply(t, n)
		}

		function r(e, t, n, r) {
			for (var i = -1, o = null == e ? 0 : e.length; ++i < o;) {
				var s = e[i];
				t(r, s, n(s), e)
			}
			return r
		}

		function i(e, t) {
			for (var n = -1, r = null == e ? 0 : e.length; ++n < r && t(e[n], n, e) !== !1;);
			return e
		}

		function o(e, t) {
			for (var n = null == e ? 0 : e.length; n-- && t(e[n], n, e) !== !1;);
			return e
		}

		function s(e, t) {
			for (var n = -1, r = null == e ? 0 : e.length; ++n < r;)
				if (!t(e[n], n, e)) return !1;
			return !0
		}

		function a(e, t) {
			for (var n = -1, r = null == e ? 0 : e.length, i = 0, o = []; ++n < r;) {
				var s = e[n];
				t(s, n, e) && (o[i++] = s)
			}
			return o
		}

		function u(e, t) {
			var n = null == e ? 0 : e.length;
			return !!n && b(e, t, 0) > -1
		}

		function l(e, t, n) {
			for (var r = -1, i = null == e ? 0 : e.length; ++r < i;)
				if (n(t, e[r])) return !0;
			return !1
		}

		function c(e, t) {
			for (var n = -1, r = null == e ? 0 : e.length, i = Array(r); ++n < r;) i[n] = t(e[n], n, e);
			return i
		}

		function p(e, t) {
			for (var n = -1, r = t.length, i = e.length; ++n < r;) e[i + n] = t[n];
			return e
		}

		function f(e, t, n, r) {
			var i = -1,
				o = null == e ? 0 : e.length;
			for (r && o && (n = e[++i]); ++i < o;) n = t(n, e[i], i, e);
			return n
		}

		function h(e, t, n, r) {
			var i = null == e ? 0 : e.length;
			for (r && i && (n = e[--i]); i--;) n = t(n, e[i], i, e);
			return n
		}

		function d(e, t) {
			for (var n = -1, r = null == e ? 0 : e.length; ++n < r;)
				if (t(e[n], n, e)) return !0;
			return !1
		}

		function g(e) {
			return e.split("")
		}

		function v(e) {
			return e.match(Dt) || []
		}

		function y(e, t, n) {
			var r;
			return n(e, function(e, n, i) {
				if (t(e, n, i)) return r = n, !1
			}), r
		}

		function m(e, t, n, r) {
			for (var i = e.length, o = n + (r ? 1 : -1); r ? o-- : ++o < i;)
				if (t(e[o], o, e)) return o;
			return -1
		}

		function b(e, t, n) {
			return t === t ? W(e, t, n) : m(e, w, n)
		}

		function x(e, t, n, r) {
			for (var i = n - 1, o = e.length; ++i < o;)
				if (r(e[i], t)) return i;
			return -1
		}

		function w(e) {
			return e !== e
		}

		function _(e, t) {
			var n = null == e ? 0 : e.length;
			return n ? A(e, t) / n : je
		}

		function k(e) {
			return function(t) {
				return null == t ? Q : t[e]
			}
		}

		function T(e) {
			return function(t) {
				return null == e ? Q : e[t]
			}
		}

		function E(e, t, n, r, i) {
			return i(e, function(e, i, o) {
				n = r ? (r = !1, e) : t(n, e, i, o)
			}), n
		}

		function C(e, t) {
			var n = e.length;
			for (e.sort(t); n--;) e[n] = e[n].value;
			return e
		}

		function A(e, t) {
			for (var n, r = -1, i = e.length; ++r < i;) {
				var o = t(e[r]);
				o !== Q && (n = n === Q ? o : n + o)
			}
			return n
		}

		function S(e, t) {
			for (var n = -1, r = Array(e); ++n < e;) r[n] = t(n);
			return r
		}

		function j(e, t) {
			return c(t, function(t) {
				return [t, e[t]]
			})
		}

		function O(e) {
			return function(t) {
				return e(t)
			}
		}

		function I(e, t) {
			return c(t, function(t) {
				return e[t]
			})
		}

		function R(e, t) {
			return e.has(t)
		}

		function N(e, t) {
			for (var n = -1, r = e.length; ++n < r && b(t, e[n], 0) > -1;);
			return n
		}

		function $(e, t) {
			for (var n = e.length; n-- && b(t, e[n], 0) > -1;);
			return n
		}

		function D(e, t) {
			for (var n = e.length, r = 0; n--;) e[n] === t && ++r;
			return r
		}

		function M(e) {
			return "\\" + Wn[e]
		}

		function L(e, t) {
			return null == e ? Q : e[t]
		}

		function P(e) {
			return Ln.test(e)
		}

		function B(e) {
			return Pn.test(e)
		}

		function q(e) {
			for (var t, n = []; !(t = e.next()).done;) n.push(t.value);
			return n
		}

		function F(e) {
			var t = -1,
				n = Array(e.size);
			return e.forEach(function(e, r) {
				n[++t] = [r, e]
			}), n
		}

		function V(e, t) {
			return function(n) {
				return e(t(n))
			}
		}

		function U(e, t) {
			for (var n = -1, r = e.length, i = 0, o = []; ++n < r;) {
				var s = e[n];
				s !== t && s !== se || (e[n] = se, o[i++] = n)
			}
			return o
		}

		function z(e) {
			var t = -1,
				n = Array(e.size);
			return e.forEach(function(e) {
				n[++t] = e
			}), n
		}

		function H(e) {
			var t = -1,
				n = Array(e.size);
			return e.forEach(function(e) {
				n[++t] = [e, e]
			}), n
		}

		function W(e, t, n) {
			for (var r = n - 1, i = e.length; ++r < i;)
				if (e[r] === t) return r;
			return -1
		}

		function G(e, t, n) {
			for (var r = n + 1; r--;)
				if (e[r] === t) return r;
			return r
		}

		function J(e) {
			return P(e) ? Y(e) : lr(e)
		}

		function Z(e) {
			return P(e) ? X(e) : g(e)
		}

		function Y(e) {
			for (var t = Dn.lastIndex = 0; Dn.test(e);) ++t;
			return t
		}

		function X(e) {
			return e.match(Dn) || []
		}

		function K(e) {
			return e.match(Mn) || []
		}
		var Q, ee = "4.16.6",
			te = 200,
			ne = "Unsupported core-js use. Try https://github.com/es-shims.",
			re = "Expected a function",
			ie = "__lodash_hash_undefined__",
			oe = 500,
			se = "__lodash_placeholder__",
			ae = 1,
			ue = 2,
			le = 4,
			ce = 8,
			pe = 16,
			fe = 32,
			he = 64,
			de = 128,
			ge = 256,
			ve = 512,
			ye = 1,
			me = 2,
			be = 30,
			xe = "...",
			we = 800,
			_e = 16,
			ke = 1,
			Te = 2,
			Ee = 3,
			Ce = 1 / 0,
			Ae = 9007199254740991,
			Se = 1.7976931348623157e308,
			je = NaN,
			Oe = 4294967295,
			Ie = Oe - 1,
			Re = Oe >>> 1,
			Ne = [
				["ary", de],
				["bind", ae],
				["bindKey", ue],
				["curry", ce],
				["curryRight", pe],
				["flip", ve],
				["partial", fe],
				["partialRight", he],
				["rearg", ge]
			],
			$e = "[object Arguments]",
			De = "[object Array]",
			Me = "[object AsyncFunction]",
			Le = "[object Boolean]",
			Pe = "[object Date]",
			Be = "[object DOMException]",
			qe = "[object Error]",
			Fe = "[object Function]",
			Ve = "[object GeneratorFunction]",
			Ue = "[object Map]",
			ze = "[object Number]",
			He = "[object Null]",
			We = "[object Object]",
			Ge = "[object Promise]",
			Je = "[object Proxy]",
			Ze = "[object RegExp]",
			Ye = "[object Set]",
			Xe = "[object String]",
			Ke = "[object Symbol]",
			Qe = "[object Undefined]",
			et = "[object WeakMap]",
			tt = "[object WeakSet]",
			nt = "[object ArrayBuffer]",
			rt = "[object DataView]",
			it = "[object Float32Array]",
			ot = "[object Float64Array]",
			st = "[object Int8Array]",
			at = "[object Int16Array]",
			ut = "[object Int32Array]",
			lt = "[object Uint8Array]",
			ct = "[object Uint8ClampedArray]",
			pt = "[object Uint16Array]",
			ft = "[object Uint32Array]",
			ht = /\b__p \+= '';/g,
			dt = /\b(__p \+=) '' \+/g,
			gt = /(__e\(.*?\)|\b__t\)) \+\n'';/g,
			vt = /&(?:amp|lt|gt|quot|#39);/g,
			yt = /[&<>"']/g,
			mt = RegExp(vt.source),
			bt = RegExp(yt.source),
			xt = /<%-([\s\S]+?)%>/g,
			wt = /<%([\s\S]+?)%>/g,
			_t = /<%=([\s\S]+?)%>/g,
			kt = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
			Tt = /^\w*$/,
			Et = /^\./,
			Ct = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
			At = /[\\^$.*+?()[\]{}|]/g,
			St = RegExp(At.source),
			jt = /^\s+|\s+$/g,
			Ot = /^\s+/,
			It = /\s+$/,
			Rt = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
			Nt = /\{\n\/\* \[wrapped with (.+)\] \*/,
			$t = /,? & /,
			Dt = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,
			Mt = /\\(\\)?/g,
			Lt = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
			Pt = /\w*$/,
			Bt = /^[-+]0x[0-9a-f]+$/i,
			qt = /^0b[01]+$/i,
			Ft = /^\[object .+?Constructor\]$/,
			Vt = /^0o[0-7]+$/i,
			Ut = /^(?:0|[1-9]\d*)$/,
			zt = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,
			Ht = /($^)/,
			Wt = /['\n\r\u2028\u2029\\]/g,
			Gt = "\\ud800-\\udfff",
			Jt = "\\u0300-\\u036f\\ufe20-\\ufe23",
			Zt = "\\u20d0-\\u20f0",
			Yt = "\\u2700-\\u27bf",
			Xt = "a-z\\xdf-\\xf6\\xf8-\\xff",
			Kt = "\\xac\\xb1\\xd7\\xf7",
			Qt = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",
			en = "\\u2000-\\u206f",
			tn = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",
			nn = "A-Z\\xc0-\\xd6\\xd8-\\xde",
			rn = "\\ufe0e\\ufe0f",
			on = Kt + Qt + en + tn,
			sn = "['’]",
			an = "[" + Gt + "]",
			un = "[" + on + "]",
			ln = "[" + Jt + Zt + "]",
			cn = "\\d+",
			pn = "[" + Yt + "]",
			fn = "[" + Xt + "]",
			hn = "[^" + Gt + on + cn + Yt + Xt + nn + "]",
			dn = "\\ud83c[\\udffb-\\udfff]",
			gn = "(?:" + ln + "|" + dn + ")",
			vn = "[^" + Gt + "]",
			yn = "(?:\\ud83c[\\udde6-\\uddff]){2}",
			mn = "[\\ud800-\\udbff][\\udc00-\\udfff]",
			bn = "[" + nn + "]",
			xn = "\\u200d",
			wn = "(?:" + fn + "|" + hn + ")",
			_n = "(?:" + bn + "|" + hn + ")",
			kn = "(?:" + sn + "(?:d|ll|m|re|s|t|ve))?",
			Tn = "(?:" + sn + "(?:D|LL|M|RE|S|T|VE))?",
			En = gn + "?",
			Cn = "[" + rn + "]?",
			An = "(?:" + xn + "(?:" + [vn, yn, mn].join("|") + ")" + Cn + En + ")*",
			Sn = "\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)",
			jn = "\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)",
			On = Cn + En + An,
			In = "(?:" + [pn, yn, mn].join("|") + ")" + On,
			Rn = "(?:" + [vn + ln + "?", ln, yn, mn, an].join("|") + ")",
			Nn = RegExp(sn, "g"),
			$n = RegExp(ln, "g"),
			Dn = RegExp(dn + "(?=" + dn + ")|" + Rn + On, "g"),
			Mn = RegExp([bn + "?" + fn + "+" + kn + "(?=" + [un, bn, "$"].join("|") + ")", _n + "+" + Tn + "(?=" + [un, bn + wn, "$"].join("|") + ")", bn + "?" + wn + "+" + kn, bn + "+" + Tn, jn, Sn, cn, In].join("|"), "g"),
			Ln = RegExp("[" + xn + Gt + Jt + Zt + rn + "]"),
			Pn = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
			Bn = ["Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout"],
			qn = -1,
			Fn = {};
		Fn[it] = Fn[ot] = Fn[st] = Fn[at] = Fn[ut] = Fn[lt] = Fn[ct] = Fn[pt] = Fn[ft] = !0, Fn[$e] = Fn[De] = Fn[nt] = Fn[Le] = Fn[rt] = Fn[Pe] = Fn[qe] = Fn[Fe] = Fn[Ue] = Fn[ze] = Fn[We] = Fn[Ze] = Fn[Ye] = Fn[Xe] = Fn[et] = !1;
		var Vn = {};
		Vn[$e] = Vn[De] = Vn[nt] = Vn[rt] = Vn[Le] = Vn[Pe] = Vn[it] = Vn[ot] = Vn[st] = Vn[at] = Vn[ut] = Vn[Ue] = Vn[ze] = Vn[We] = Vn[Ze] = Vn[Ye] = Vn[Xe] = Vn[Ke] = Vn[lt] = Vn[ct] = Vn[pt] = Vn[ft] = !0, Vn[qe] = Vn[Fe] = Vn[et] = !1;
		var Un = {
				"À": "A",
				"Á": "A",
				"Â": "A",
				"Ã": "A",
				"Ä": "A",
				"Å": "A",
				"� ": "a",
				"á": "a",
				"â": "a",
				"ã": "a",
				"ä": "a",
				"å": "a",
				"Ç": "C",
				"ç": "c",
				"Ð": "D",
				"ð": "d",
				"È": "E",
				"É": "E",
				"Ê": "E",
				"Ë": "E",
				"è": "e",
				"é": "e",
				"ê": "e",
				"ë": "e",
				"Ì": "I",
				"Í": "I",
				"Î": "I",
				"Ï": "I",
				"ì": "i",
				"í": "i",
				"î": "i",
				"ï": "i",
				"Ñ": "N",
				"ñ": "n",
				"Ò": "O",
				"Ó": "O",
				"Ô": "O",
				"Õ": "O",
				"Ö": "O",
				"Ø": "O",
				"ò": "o",
				"ó": "o",
				"ô": "o",
				"õ": "o",
				"ö": "o",
				"ø": "o",
				"Ù": "U",
				"Ú": "U",
				"Û": "U",
				"Ü": "U",
				"ù": "u",
				"ú": "u",
				"û": "u",
				"ü": "u",
				"Ý": "Y",
				"ý": "y",
				"ÿ": "y",
				"Æ": "Ae",
				"æ": "ae",
				"Þ": "Th",
				"þ": "th",
				"ß": "ss",
				"Ā": "A",
				"Ă": "A",
				"Ą": "A",
				"ā": "a",
				"ă": "a",
				"ą": "a",
				"Ć": "C",
				"Ĉ": "C",
				"Ċ": "C",
				"Č": "C",
				"ć": "c",
				"ĉ": "c",
				"ċ": "c",
				"č": "c",
				"Ď": "D",
				"Đ": "D",
				"ď": "d",
				"đ": "d",
				"Ē": "E",
				"Ĕ": "E",
				"Ė": "E",
				"Ę": "E",
				"Ě": "E",
				"ē": "e",
				"ĕ": "e",
				"ė": "e",
				"ę": "e",
				"ě": "e",
				"Ĝ": "G",
				"Ğ": "G",
				"� ": "G",
				"Ģ": "G",
				"ĝ": "g",
				"ğ": "g",
				"ġ": "g",
				"ģ": "g",
				"Ĥ": "H",
				"Ħ": "H",
				"ĥ": "h",
				"ħ": "h",
				"Ĩ": "I",
				"Ī": "I",
				"Ĭ": "I",
				"Į": "I",
				"İ": "I",
				"ĩ": "i",
				"ī": "i",
				"ĭ": "i",
				"į": "i",
				"ı": "i",
				"Ĵ": "J",
				"ĵ": "j",
				"Ķ": "K",
				"ķ": "k",
				"ĸ": "k",
				"Ĺ": "L",
				"Ļ": "L",
				"Ľ": "L",
				"Ŀ": "L",
				"Ł": "L",
				"ĺ": "l",
				"ļ": "l",
				"ľ": "l",
				"ŀ": "l",
				"ł": "l",
				"Ń": "N",
				"Ņ": "N",
				"Ň": "N",
				"Ŋ": "N",
				"ń": "n",
				"ņ": "n",
				"ň": "n",
				"ŋ": "n",
				"Ō": "O",
				"Ŏ": "O",
				"Ő": "O",
				"ō": "o",
				"ŏ": "o",
				"ő": "o",
				"Ŕ": "R",
				"Ŗ": "R",
				"Ř": "R",
				"ŕ": "r",
				"ŗ": "r",
				"ř": "r",
				"Ś": "S",
				"Ŝ": "S",
				"Ş": "S",
				"� ": "S",
				"ś": "s",
				"ŝ": "s",
				"ş": "s",
				"š": "s",
				"Ţ": "T",
				"Ť": "T",
				"Ŧ": "T",
				"ţ": "t",
				"ť": "t",
				"ŧ": "t",
				"Ũ": "U",
				"Ū": "U",
				"Ŭ": "U",
				"Ů": "U",
				"Ű": "U",
				"Ų": "U",
				"ũ": "u",
				"ū": "u",
				"ŭ": "u",
				"ů": "u",
				"ű": "u",
				"ų": "u",
				"Ŵ": "W",
				"ŵ": "w",
				"Ŷ": "Y",
				"ŷ": "y",
				"Ÿ": "Y",
				"Ź": "Z",
				"Ż": "Z",
				"Ž": "Z",
				"ź": "z",
				"ż": "z",
				"ž": "z",
				"Ĳ": "IJ",
				"ĳ": "ij",
				"Œ": "Oe",
				"œ": "oe",
				"ŉ": "'n",
				"ſ": "s"
			},
			zn = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;"
			},
			Hn = {
				"&amp;": "&",
				"&lt;": "<",
				"&gt;": ">",
				"&quot;": '"',
				"&#39;": "'"
			},
			Wn = {
				"\\": "\\",
				"'": "'",
				"\n": "n",
				"\r": "r",
				"\u2028": "u2028",
				"\u2029": "u2029"
			},
			Gn = parseFloat,
			Jn = parseInt,
			Zn = "object" == typeof global && global && global.Object === Object && global,
			Yn = "object" == typeof self && self && self.Object === Object && self,
			Xn = Zn || Yn || Function("return this")(),
			Kn = "object" == typeof exports && exports && !exports.nodeType && exports,
			Qn = Kn && "object" == typeof module && module && !module.nodeType && module,
			er = Qn && Qn.exports === Kn,
			tr = er && Zn.process,
			nr = function() {
				try {
					return tr && tr.binding("util")
				} catch (e) {}
			}(),
			rr = nr && nr.isArrayBuffer,
			ir = nr && nr.isDate,
			or = nr && nr.isMap,
			sr = nr && nr.isRegExp,
			ar = nr && nr.isSet,
			ur = nr && nr.isTypedArray,
			lr = k("length"),
			cr = T(Un),
			pr = T(zn),
			fr = T(Hn),
			hr = function g(T) {
				function W(e) {
					if (ru(e) && !gf(e) && !(e instanceof Dt)) {
						if (e instanceof X) return e;
						if (dc.call(e, "__wrapped__")) return es(e)
					}
					return new X(e)
				}

				function Y() {}

				function X(e, t) {
					this.__wrapped__ = e, this.__actions__ = [], this.__chain__ = !!t, this.__index__ = 0, this.__values__ = Q
				}

				function Dt(e) {
					this.__wrapped__ = e, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Oe, this.__views__ = []
				}

				function Gt() {
					var e = new Dt(this.__wrapped__);
					return e.__actions__ = Li(this.__actions__), e.__dir__ = this.__dir__, e.__filtered__ = this.__filtered__, e.__iteratees__ = Li(this.__iteratees__), e.__takeCount__ = this.__takeCount__, e.__views__ = Li(this.__views__), e
				}

				function Jt() {
					if (this.__filtered__) {
						var e = new Dt(this);
						e.__dir__ = -1, e.__filtered__ = !0
					} else e = this.clone(), e.__dir__ *= -1;
					return e
				}

				function Zt() {
					var e = this.__wrapped__.value(),
						t = this.__dir__,
						n = gf(e),
						r = t < 0,
						i = n ? e.length : 0,
						o = ko(0, i, this.__views__),
						s = o.start,
						a = o.end,
						u = a - s,
						l = r ? a : s - 1,
						c = this.__iteratees__,
						p = c.length,
						f = 0,
						h = zc(u, this.__takeCount__);
					if (!n || i < te || i == u && h == u) return mi(e, this.__actions__);
					var d = [];
					e: for (; u-- && f < h;) {
						l += t;
						for (var g = -1, v = e[l]; ++g < p;) {
							var y = c[g],
								m = y.iteratee,
								b = y.type,
								x = m(v);
							if (b == Te) v = x;
							else if (!x) {
								if (b == ke) continue e;
								break e
							}
						}
						d[f++] = v
					}
					return d
				}

				function Yt(e) {
					var t = -1,
						n = null == e ? 0 : e.length;
					for (this.clear(); ++t < n;) {
						var r = e[t];
						this.set(r[0], r[1])
					}
				}

				function Xt() {
					this.__data__ = ep ? ep(null) : {}, this.size = 0
				}

				function Kt(e) {
					var t = this.has(e) && delete this.__data__[e];
					return this.size -= t ? 1 : 0, t
				}

				function Qt(e) {
					var t = this.__data__;
					if (ep) {
						var n = t[e];
						return n === ie ? Q : n
					}
					return dc.call(t, e) ? t[e] : Q
				}

				function en(e) {
					var t = this.__data__;
					return ep ? t[e] !== Q : dc.call(t, e)
				}

				function tn(e, t) {
					var n = this.__data__;
					return this.size += this.has(e) ? 0 : 1, n[e] = ep && t === Q ? ie : t, this
				}

				function nn(e) {
					var t = -1,
						n = null == e ? 0 : e.length;
					for (this.clear(); ++t < n;) {
						var r = e[t];
						this.set(r[0], r[1])
					}
				}

				function rn() {
					this.__data__ = [], this.size = 0
				}

				function on(e) {
					var t = this.__data__,
						n = In(t, e);
					if (n < 0) return !1;
					var r = t.length - 1;
					return n == r ? t.pop() : Sc.call(t, n, 1), --this.size, !0
				}

				function sn(e) {
					var t = this.__data__,
						n = In(t, e);
					return n < 0 ? Q : t[n][1]
				}

				function an(e) {
					return In(this.__data__, e) > -1
				}

				function un(e, t) {
					var n = this.__data__,
						r = In(n, e);
					return r < 0 ? (++this.size, n.push([e, t])) : n[r][1] = t, this
				}

				function ln(e) {
					var t = -1,
						n = null == e ? 0 : e.length;
					for (this.clear(); ++t < n;) {
						var r = e[t];
						this.set(r[0], r[1])
					}
				}

				function cn() {
					this.size = 0, this.__data__ = {
						hash: new Yt,
						map: new(Yc || nn),
						string: new Yt
					}
				}

				function pn(e) {
					var t = bo(this, e).delete(e);
					return this.size -= t ? 1 : 0, t
				}

				function fn(e) {
					return bo(this, e).get(e)
				}

				function hn(e) {
					return bo(this, e).has(e)
				}

				function dn(e, t) {
					var n = bo(this, e),
						r = n.size;
					return n.set(e, t), this.size += n.size == r ? 0 : 1, this
				}

				function gn(e) {
					var t = -1,
						n = null == e ? 0 : e.length;
					for (this.__data__ = new ln; ++t < n;) this.add(e[t])
				}

				function vn(e) {
					return this.__data__.set(e, ie), this
				}

				function yn(e) {
					return this.__data__.has(e)
				}

				function mn(e) {
					var t = this.__data__ = new nn(e);
					this.size = t.size
				}

				function bn() {
					this.__data__ = new nn, this.size = 0
				}

				function xn(e) {
					var t = this.__data__,
						n = t.delete(e);
					return this.size = t.size, n
				}

				function wn(e) {
					return this.__data__.get(e)
				}

				function _n(e) {
					return this.__data__.has(e)
				}

				function kn(e, t) {
					var n = this.__data__;
					if (n instanceof nn) {
						var r = n.__data__;
						if (!Yc || r.length < te - 1) return r.push([e, t]), this.size = ++n.size, this;
						n = this.__data__ = new ln(r)
					}
					return n.set(e, t), this.size = n.size, this
				}

				function Tn(e, t) {
					var n = gf(e),
						r = !n && df(e),
						i = !n && !r && yf(e),
						o = !n && !r && !i && _f(e),
						s = n || r || i || o,
						a = s ? S(e.length, ac) : [],
						u = a.length;
					for (var l in e) !t && !dc.call(e, l) || s && ("length" == l || i && ("offset" == l || "parent" == l) || o && ("buffer" == l || "byteLength" == l || "byteOffset" == l) || Io(l, u)) || a.push(l);
					return a
				}

				function En(e) {
					var t = e.length;
					return t ? e[Qr(0, t - 1)] : Q
				}

				function Cn(e, t) {
					return Yo(Li(e), Pn(t, 0, e.length))
				}

				function An(e) {
					return Yo(Li(e))
				}

				function Sn(e, t, n, r) {
					return e === Q || Ua(e, pc[n]) && !dc.call(r, n) ? t : e
				}

				function jn(e, t, n) {
					(n === Q || Ua(e[t], n)) && (n !== Q || t in e) || Mn(e, t, n)
				}

				function On(e, t, n) {
					var r = e[t];
					dc.call(e, t) && Ua(r, n) && (n !== Q || t in e) || Mn(e, t, n)
				}

				function In(e, t) {
					for (var n = e.length; n--;)
						if (Ua(e[n][0], t)) return n;
					return -1
				}

				function Rn(e, t, n, r) {
					return fp(e, function(e, i, o) {
						t(r, e, n(e), o)
					}), r
				}

				function Dn(e, t) {
					return e && Pi(t, Pu(t), e)
				}

				function Mn(e, t, n) {
					"__proto__" == t && Rc ? Rc(e, t, {
						configurable: !0,
						enumerable: !0,
						value: n,
						writable: !0
					}) : e[t] = n
				}

				function Ln(e, t) {
					for (var n = -1, r = t.length, i = ec(r), o = null == e; ++n < r;) i[n] = o ? Q : Du(e, t[n]);
					return i
				}

				function Pn(e, t, n) {
					return e === e && (n !== Q && (e = e <= n ? e : n), t !== Q && (e = e >= t ? e : t)), e
				}

				function Un(e, t, n, r, o, s, a) {
					var u;
					if (r && (u = s ? r(e, o, s, a) : r(e)), u !== Q) return u;
					if (!nu(e)) return e;
					var l = gf(e);
					if (l) {
						if (u = Co(e), !t) return Li(e, u)
					} else {
						var c = Tp(e),
							p = c == Fe || c == Ve;
						if (yf(e)) return Ei(e, t);
						if (c == We || c == $e || p && !s) {
							if (u = Ao(p ? {} : e), !t) return Bi(e, Dn(u, e))
						} else {
							if (!Vn[c]) return s ? e : {};
							u = So(e, c, Un, t)
						}
					}
					a || (a = new mn);
					var f = a.get(e);
					if (f) return f;
					a.set(e, u);
					var h = l ? Q : (n ? ho : Pu)(e);
					return i(h || e, function(i, o) {
						h && (o = i, i = e[o]), On(u, o, Un(i, t, n, r, o, e, a))
					}), u
				}

				function zn(e) {
					var t = Pu(e);
					return function(n) {
						return Hn(n, e, t)
					}
				}

				function Hn(e, t, n) {
					var r = n.length;
					if (null == e) return !r;
					for (e = oc(e); r--;) {
						var i = n[r],
							o = t[i],
							s = e[i];
						if (s === Q && !(i in e) || !o(s)) return !1
					}
					return !0
				}

				function Wn(e, t, n) {
					if ("function" != typeof e) throw new uc(re);
					return Ap(function() {
						e.apply(Q, n)
					}, t)
				}

				function Zn(e, t, n, r) {
					var i = -1,
						o = u,
						s = !0,
						a = e.length,
						p = [],
						f = t.length;
					if (!a) return p;
					n && (t = c(t, O(n))), r ? (o = l, s = !1) : t.length >= te && (o = R, s = !1, t = new gn(t));
					e: for (; ++i < a;) {
						var h = e[i],
							d = null == n ? h : n(h);
						if (h = r || 0 !== h ? h : 0, s && d === d) {
							for (var g = f; g--;)
								if (t[g] === d) continue e;
							p.push(h)
						} else o(t, d, r) || p.push(h)
					}
					return p
				}

				function Yn(e, t) {
					var n = !0;
					return fp(e, function(e, r, i) {
						return n = !!t(e, r, i)
					}), n
				}

				function Kn(e, t, n) {
					for (var r = -1, i = e.length; ++r < i;) {
						var o = e[r],
							s = t(o);
						if (null != s && (a === Q ? s === s && !du(s) : n(s, a))) var a = s,
							u = o
					}
					return u
				}

				function Qn(e, t, n, r) {
					var i = e.length;
					for (n = xu(n), n < 0 && (n = -n > i ? 0 : i + n), r = r === Q || r > i ? i : xu(r), r < 0 && (r += i), r = n > r ? 0 : wu(r); n < r;) e[n++] = t;
					return e
				}

				function tr(e, t) {
					var n = [];
					return fp(e, function(e, r, i) {
						t(e, r, i) && n.push(e)
					}), n
				}

				function nr(e, t, n, r, i) {
					var o = -1,
						s = e.length;
					for (n || (n = Oo), i || (i = []); ++o < s;) {
						var a = e[o];
						t > 0 && n(a) ? t > 1 ? nr(a, t - 1, n, r, i) : p(i, a) : r || (i[i.length] = a)
					}
					return i
				}

				function lr(e, t) {
					return e && dp(e, t, Pu)
				}

				function hr(e, t) {
					return e && gp(e, t, Pu)
				}

				function gr(e, t) {
					return a(t, function(t) {
						return Qa(e[t])
					})
				}

				function vr(e, t) {
					t = No(t, e) ? [t] : ki(t);
					for (var n = 0, r = t.length; null != e && n < r;) e = e[Xo(t[n++])];
					return n && n == r ? e : Q
				}

				function yr(e, t, n) {
					var r = t(e);
					return gf(e) ? r : p(r, n(e))
				}

				function mr(e) {
					return null == e ? e === Q ? Qe : He : (e = oc(e), Ic && Ic in e ? _o(e) : zo(e))
				}

				function br(e, t) {
					return e > t
				}

				function xr(e, t) {
					return null != e && dc.call(e, t)
				}

				function wr(e, t) {
					return null != e && t in oc(e)
				}

				function _r(e, t, n) {
					return e >= zc(t, n) && e < Uc(t, n)
				}

				function kr(e, t, n) {
					for (var r = n ? l : u, i = e[0].length, o = e.length, s = o, a = ec(o), p = 1 / 0, f = []; s--;) {
						var h = e[s];
						s && t && (h = c(h, O(t))), p = zc(h.length, p), a[s] = !n && (t || i >= 120 && h.length >= 120) ? new gn(s && h) : Q
					}
					h = e[0];
					var d = -1,
						g = a[0];
					e: for (; ++d < i && f.length < p;) {
						var v = h[d],
							y = t ? t(v) : v;
						if (v = n || 0 !== v ? v : 0, !(g ? R(g, y) : r(f, y, n))) {
							for (s = o; --s;) {
								var m = a[s];
								if (!(m ? R(m, y) : r(e[s], y, n))) continue e
							}
							g && g.push(y), f.push(v)
						}
					}
					return f
				}

				function Tr(e, t, n, r) {
					return lr(e, function(e, i, o) {
						t(r, n(e), i, o)
					}), r
				}

				function Er(e, t, r) {
					No(t, e) || (t = ki(t), e = Wo(e, t), t = bs(t));
					var i = null == e ? e : e[Xo(t)];
					return null == i ? Q : n(i, e, r)
				}

				function Cr(e) {
					return ru(e) && mr(e) == $e
				}

				function Ar(e) {
					return ru(e) && mr(e) == nt
				}

				function Sr(e) {
					return ru(e) && mr(e) == Pe
				}

				function jr(e, t, n, r, i) {
					return e === t || (null == e || null == t || !nu(e) && !ru(t) ? e !== e && t !== t : Or(e, t, jr, n, r, i))
				}

				function Or(e, t, n, r, i, o) {
					var s = gf(e),
						a = gf(t),
						u = De,
						l = De;
					s || (u = Tp(e), u = u == $e ? We : u), a || (l = Tp(t), l = l == $e ? We : l);
					var c = u == We,
						p = l == We,
						f = u == l;
					if (f && yf(e)) {
						if (!yf(t)) return !1;
						s = !0, c = !1
					}
					if (f && !c) return o || (o = new mn), s || _f(e) ? lo(e, t, n, r, i, o) : co(e, t, u, n, r, i, o);
					if (!(i & me)) {
						var h = c && dc.call(e, "__wrapped__"),
							d = p && dc.call(t, "__wrapped__");
						if (h || d) {
							var g = h ? e.value() : e,
								v = d ? t.value() : t;
							return o || (o = new mn), n(g, v, r, i, o)
						}
					}
					return !!f && (o || (o = new mn), po(e, t, n, r, i, o))
				}

				function Ir(e) {
					return ru(e) && Tp(e) == Ue
				}

				function Rr(e, t, n, r) {
					var i = n.length,
						o = i,
						s = !r;
					if (null == e) return !o;
					for (e = oc(e); i--;) {
						var a = n[i];
						if (s && a[2] ? a[1] !== e[a[0]] : !(a[0] in e)) return !1
					}
					for (; ++i < o;) {
						a = n[i];
						var u = a[0],
							l = e[u],
							c = a[1];
						if (s && a[2]) {
							if (l === Q && !(u in e)) return !1
						} else {
							var p = new mn;
							if (r) var f = r(l, c, u, e, t, p);
							if (!(f === Q ? jr(c, l, r, ye | me, p) : f)) return !1
						}
					}
					return !0
				}

				function Nr(e) {
					if (!nu(e) || Mo(e)) return !1;
					var t = Qa(e) ? xc : Ft;
					return t.test(Ko(e))
				}

				function $r(e) {
					return ru(e) && mr(e) == Ze
				}

				function Dr(e) {
					return ru(e) && Tp(e) == Ye
				}

				function Mr(e) {
					return ru(e) && tu(e.length) && !!Fn[mr(e)]
				}

				function Lr(e) {
					return "function" == typeof e ? e : null == e ? Sl : "object" == typeof e ? gf(e) ? Ur(e[0], e[1]) : Vr(e) : Ml(e)
				}

				function Pr(e) {
					if (!Lo(e)) return Vc(e);
					var t = [];
					for (var n in oc(e)) dc.call(e, n) && "constructor" != n && t.push(n);
					return t
				}

				function Br(e) {
					if (!nu(e)) return Uo(e);
					var t = Lo(e),
						n = [];
					for (var r in e)("constructor" != r || !t && dc.call(e, r)) && n.push(r);
					return n
				}

				function qr(e, t) {
					return e < t
				}

				function Fr(e, t) {
					var n = -1,
						r = za(e) ? ec(e.length) : [];
					return fp(e, function(e, i, o) {
						r[++n] = t(e, i, o)
					}), r
				}

				function Vr(e) {
					var t = xo(e);
					return 1 == t.length && t[0][2] ? Bo(t[0][0], t[0][1]) : function(n) {
						return n === e || Rr(n, e, t)
					}
				}

				function Ur(e, t) {
					return No(e) && Po(t) ? Bo(Xo(e), t) : function(n) {
						var r = Du(n, e);
						return r === Q && r === t ? Lu(n, e) : jr(t, r, Q, ye | me)
					}
				}

				function zr(e, t, n, r, i) {
					e !== t && dp(t, function(o, s) {
						if (nu(o)) i || (i = new mn), Hr(e, t, s, n, zr, r, i);
						else {
							var a = r ? r(e[s], o, s + "", e, t, i) : Q;
							a === Q && (a = o), jn(e, s, a)
						}
					}, Bu)
				}

				function Hr(e, t, n, r, i, o, s) {
					var a = e[n],
						u = t[n],
						l = s.get(u);
					if (l) return void jn(e, n, l);
					var c = o ? o(a, u, n + "", e, t, s) : Q,
						p = c === Q;
					if (p) {
						var f = gf(u),
							h = !f && yf(u),
							d = !f && !h && _f(u);
						c = u, f || h || d ? gf(a) ? c = a : Ha(a) ? c = Li(a) : h ? (p = !1, c = Ei(u, !0)) : d ? (p = !1, c = Ri(u, !0)) : c = [] : pu(u) || df(u) ? (c = a, df(a) ? c = ku(a) : (!nu(a) || r && Qa(a)) && (c = Ao(u))) : p = !1
					}
					p && (s.set(u, c), i(c, u, r, o, s), s.delete(u)), jn(e, n, c)
				}

				function Wr(e, t) {
					var n = e.length;
					if (n) return t += t < 0 ? n : 0, Io(t, n) ? e[t] : Q
				}

				function Gr(e, t, n) {
					var r = -1;
					t = c(t.length ? t : [Sl], O(mo()));
					var i = Fr(e, function(e, n, i) {
						var o = c(t, function(t) {
							return t(e)
						});
						return {
							criteria: o,
							index: ++r,
							value: e
						}
					});
					return C(i, function(e, t) {
						return $i(e, t, n)
					})
				}

				function Jr(e, t) {
					return e = oc(e), Zr(e, t, function(t, n) {
						return n in e
					})
				}

				function Zr(e, t, n) {
					for (var r = -1, i = t.length, o = {}; ++r < i;) {
						var s = t[r],
							a = e[s];
						n(a, s) && Mn(o, s, a)
					}
					return o
				}

				function Yr(e) {
					return function(t) {
						return vr(t, e)
					}
				}

				function Xr(e, t, n, r) {
					var i = r ? x : b,
						o = -1,
						s = t.length,
						a = e;
					for (e === t && (t = Li(t)), n && (a = c(e, O(n))); ++o < s;)
						for (var u = 0, l = t[o], p = n ? n(l) : l;
							(u = i(a, p, u, r)) > -1;) a !== e && Sc.call(a, u, 1), Sc.call(e, u, 1);
					return e
				}

				function Kr(e, t) {
					for (var n = e ? t.length : 0, r = n - 1; n--;) {
						var i = t[n];
						if (n == r || i !== o) {
							var o = i;
							if (Io(i)) Sc.call(e, i, 1);
							else if (No(i, e)) delete e[Xo(i)];
							else {
								var s = ki(i),
									a = Wo(e, s);
								null != a && delete a[Xo(bs(s))]
							}
						}
					}
					return e
				}

				function Qr(e, t) {
					return e + Lc(Gc() * (t - e + 1))
				}

				function ei(e, t, n, r) {
					for (var i = -1, o = Uc(Mc((t - e) / (n || 1)), 0), s = ec(o); o--;) s[r ? o : ++i] = e, e += n;
					return s
				}

				function ti(e, t) {
					var n = "";
					if (!e || t < 1 || t > Ae) return n;
					do t % 2 && (n += e), t = Lc(t / 2), t && (e += e); while (t);
					return n
				}

				function ni(e, t) {
					return Sp(Ho(e, t, Sl), e + "")
				}

				function ri(e) {
					return En(Xu(e))
				}

				function ii(e, t) {
					var n = Xu(e);
					return Yo(n, Pn(t, 0, n.length))
				}

				function oi(e, t, n, r) {
					if (!nu(e)) return e;
					t = No(t, e) ? [t] : ki(t);
					for (var i = -1, o = t.length, s = o - 1, a = e; null != a && ++i < o;) {
						var u = Xo(t[i]),
							l = n;
						if (i != s) {
							var c = a[u];
							l = r ? r(c, u, a) : Q, l === Q && (l = nu(c) ? c : Io(t[i + 1]) ? [] : {})
						}
						On(a, u, l), a = a[u]
					}
					return e
				}

				function si(e) {
					return Yo(Xu(e))
				}

				function ai(e, t, n) {
					var r = -1,
						i = e.length;
					t < 0 && (t = -t > i ? 0 : i + t), n = n > i ? i : n, n < 0 && (n += i), i = t > n ? 0 : n - t >>> 0, t >>>= 0;
					for (var o = ec(i); ++r < i;) o[r] = e[r + t];
					return o
				}

				function ui(e, t) {
					var n;
					return fp(e, function(e, r, i) {
						return n = t(e, r, i), !n
					}), !!n
				}

				function li(e, t, n) {
					var r = 0,
						i = null == e ? r : e.length;
					if ("number" == typeof t && t === t && i <= Re) {
						for (; r < i;) {
							var o = r + i >>> 1,
								s = e[o];
							null !== s && !du(s) && (n ? s <= t : s < t) ? r = o + 1 : i = o
						}
						return i
					}
					return ci(e, t, Sl, n)
				}

				function ci(e, t, n, r) {
					t = n(t);
					for (var i = 0, o = null == e ? 0 : e.length, s = t !== t, a = null === t, u = du(t), l = t === Q; i < o;) {
						var c = Lc((i + o) / 2),
							p = n(e[c]),
							f = p !== Q,
							h = null === p,
							d = p === p,
							g = du(p);
						if (s) var v = r || d;
						else v = l ? d && (r || f) : a ? d && f && (r || !h) : u ? d && f && !h && (r || !g) : !h && !g && (r ? p <= t : p < t);
						v ? i = c + 1 : o = c
					}
					return zc(o, Ie)
				}

				function pi(e, t) {
					for (var n = -1, r = e.length, i = 0, o = []; ++n < r;) {
						var s = e[n],
							a = t ? t(s) : s;
						if (!n || !Ua(a, u)) {
							var u = a;
							o[i++] = 0 === s ? 0 : s
						}
					}
					return o
				}

				function fi(e) {
					return "number" == typeof e ? e : du(e) ? je : +e
				}

				function hi(e) {
					if ("string" == typeof e) return e;
					if (gf(e)) return c(e, hi) + "";
					if (du(e)) return cp ? cp.call(e) : "";
					var t = e + "";
					return "0" == t && 1 / e == -Ce ? "-0" : t
				}

				function di(e, t, n) {
					var r = -1,
						i = u,
						o = e.length,
						s = !0,
						a = [],
						c = a;
					if (n) s = !1, i = l;
					else if (o >= te) {
						var p = t ? null : xp(e);
						if (p) return z(p);
						s = !1, i = R, c = new gn
					} else c = t ? [] : a;
					e: for (; ++r < o;) {
						var f = e[r],
							h = t ? t(f) : f;
						if (f = n || 0 !== f ? f : 0, s && h === h) {
							for (var d = c.length; d--;)
								if (c[d] === h) continue e;
							t && c.push(h), a.push(f)
						} else i(c, h, n) || (c !== a && c.push(h), a.push(f))
					}
					return a
				}

				function gi(e, t) {
					t = No(t, e) ? [t] : ki(t), e = Wo(e, t);
					var n = Xo(bs(t));
					return !(null != e && dc.call(e, n)) || delete e[n]
				}

				function vi(e, t, n, r) {
					return oi(e, t, n(vr(e, t)), r)
				}

				function yi(e, t, n, r) {
					for (var i = e.length, o = r ? i : -1;
						(r ? o-- : ++o < i) && t(e[o], o, e););
					return n ? ai(e, r ? 0 : o, r ? o + 1 : i) : ai(e, r ? o + 1 : 0, r ? i : o)
				}

				function mi(e, t) {
					var n = e;
					return n instanceof Dt && (n = n.value()), f(t, function(e, t) {
						return t.func.apply(t.thisArg, p([e], t.args))
					}, n)
				}

				function bi(e, t, n) {
					var r = e.length;
					if (r < 2) return r ? di(e[0]) : [];
					for (var i = -1, o = ec(r); ++i < r;)
						for (var s = e[i], a = -1; ++a < r;) a != i && (o[i] = Zn(o[i] || s, e[a], t, n));
					return di(nr(o, 1), t, n)
				}

				function xi(e, t, n) {
					for (var r = -1, i = e.length, o = t.length, s = {}; ++r < i;) {
						var a = r < o ? t[r] : Q;
						n(s, e[r], a)
					}
					return s
				}

				function wi(e) {
					return Ha(e) ? e : []
				}

				function _i(e) {
					return "function" == typeof e ? e : Sl
				}

				function ki(e) {
					return gf(e) ? e : jp(e)
				}

				function Ti(e, t, n) {
					var r = e.length;
					return n = n === Q ? r : n, !t && n >= r ? e : ai(e, t, n)
				}

				function Ei(e, t) {
					if (t) return e.slice();
					var n = e.length,
						r = Tc ? Tc(n) : new e.constructor(n);
					return e.copy(r), r
				}

				function Ci(e) {
					var t = new e.constructor(e.byteLength);
					return new kc(t).set(new kc(e)), t
				}

				function Ai(e, t) {
					var n = t ? Ci(e.buffer) : e.buffer;
					return new e.constructor(n, e.byteOffset, e.byteLength)
				}

				function Si(t, n, r) {
					var i = n ? r(F(t), !0) : F(t);
					return f(i, e, new t.constructor)
				}

				function ji(e) {
					var t = new e.constructor(e.source, Pt.exec(e));
					return t.lastIndex = e.lastIndex, t
				}

				function Oi(e, n, r) {
					var i = n ? r(z(e), !0) : z(e);
					return f(i, t, new e.constructor)
				}

				function Ii(e) {
					return lp ? oc(lp.call(e)) : {}
				}

				function Ri(e, t) {
					var n = t ? Ci(e.buffer) : e.buffer;
					return new e.constructor(n, e.byteOffset, e.length)
				}

				function Ni(e, t) {
					if (e !== t) {
						var n = e !== Q,
							r = null === e,
							i = e === e,
							o = du(e),
							s = t !== Q,
							a = null === t,
							u = t === t,
							l = du(t);
						if (!a && !l && !o && e > t || o && s && u && !a && !l || r && s && u || !n && u || !i) return 1;
						if (!r && !o && !l && e < t || l && n && i && !r && !o || a && n && i || !s && i || !u) return -1
					}
					return 0
				}

				function $i(e, t, n) {
					for (var r = -1, i = e.criteria, o = t.criteria, s = i.length, a = n.length; ++r < s;) {
						var u = Ni(i[r], o[r]);
						if (u) {
							if (r >= a) return u;
							var l = n[r];
							return u * ("desc" == l ? -1 : 1)
						}
					}
					return e.index - t.index
				}

				function Di(e, t, n, r) {
					for (var i = -1, o = e.length, s = n.length, a = -1, u = t.length, l = Uc(o - s, 0), c = ec(u + l), p = !r; ++a < u;) c[a] = t[a];
					for (; ++i < s;)(p || i < o) && (c[n[i]] = e[i]);
					for (; l--;) c[a++] = e[i++];
					return c
				}

				function Mi(e, t, n, r) {
					for (var i = -1, o = e.length, s = -1, a = n.length, u = -1, l = t.length, c = Uc(o - a, 0), p = ec(c + l), f = !r; ++i < c;) p[i] = e[i];
					for (var h = i; ++u < l;) p[h + u] = t[u];
					for (; ++s < a;)(f || i < o) && (p[h + n[s]] = e[i++]);
					return p
				}

				function Li(e, t) {
					var n = -1,
						r = e.length;
					for (t || (t = ec(r)); ++n < r;) t[n] = e[n];
					return t
				}

				function Pi(e, t, n, r) {
					var i = !n;
					n || (n = {});
					for (var o = -1, s = t.length; ++o < s;) {
						var a = t[o],
							u = r ? r(n[a], e[a], a, n, e) : Q;
						u === Q && (u = e[a]), i ? Mn(n, a, u) : On(n, a, u)
					}
					return n
				}

				function Bi(e, t) {
					return Pi(e, _p(e), t)
				}

				function qi(e, t) {
					return function(n, i) {
						var o = gf(n) ? r : Rn,
							s = t ? t() : {};
						return o(n, e, mo(i, 2), s)
					}
				}

				function Fi(e) {
					return ni(function(t, n) {
						var r = -1,
							i = n.length,
							o = i > 1 ? n[i - 1] : Q,
							s = i > 2 ? n[2] : Q;
						for (o = e.length > 3 && "function" == typeof o ? (i--, o) : Q, s && Ro(n[0], n[1], s) && (o = i < 3 ? Q : o, i = 1), t = oc(t); ++r < i;) {
							var a = n[r];
							a && e(t, a, r, o)
						}
						return t
					})
				}

				function Vi(e, t) {
					return function(n, r) {
						if (null == n) return n;
						if (!za(n)) return e(n, r);
						for (var i = n.length, o = t ? i : -1, s = oc(n);
							(t ? o-- : ++o < i) && r(s[o], o, s) !== !1;);
						return n
					}
				}

				function Ui(e) {
					return function(t, n, r) {
						for (var i = -1, o = oc(t), s = r(t), a = s.length; a--;) {
							var u = s[e ? a : ++i];
							if (n(o[u], u, o) === !1) break
						}
						return t
					}
				}

				function zi(e, t, n) {
					function r() {
						var t = this && this !== Xn && this instanceof r ? o : e;
						return t.apply(i ? n : this, arguments)
					}
					var i = t & ae,
						o = Gi(e);
					return r
				}

				function Hi(e) {
					return function(t) {
						t = Eu(t);
						var n = P(t) ? Z(t) : Q,
							r = n ? n[0] : t.charAt(0),
							i = n ? Ti(n, 1).join("") : t.slice(1);
						return r[e]() + i
					}
				}

				function Wi(e) {
					return function(t) {
						return f(kl(rl(t).replace(Nn, "")), e, "")
					}
				}

				function Gi(e) {
					return function() {
						var t = arguments;
						switch (t.length) {
							case 0:
								return new e;
							case 1:
								return new e(t[0]);
							case 2:
								return new e(t[0], t[1]);
							case 3:
								return new e(t[0], t[1], t[2]);
							case 4:
								return new e(t[0], t[1], t[2], t[3]);
							case 5:
								return new e(t[0], t[1], t[2], t[3], t[4]);
							case 6:
								return new e(t[0], t[1], t[2], t[3], t[4], t[5]);
							case 7:
								return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6])
						}
						var n = pp(e.prototype),
							r = e.apply(n, t);
						return nu(r) ? r : n
					}
				}

				function Ji(e, t, r) {
					function i() {
						for (var s = arguments.length, a = ec(s), u = s, l = yo(i); u--;) a[u] = arguments[u];
						var c = s < 3 && a[0] !== l && a[s - 1] !== l ? [] : U(a, l);
						if (s -= c.length, s < r) return oo(e, t, Xi, i.placeholder, Q, a, c, Q, Q, r - s);
						var p = this && this !== Xn && this instanceof i ? o : e;
						return n(p, this, a)
					}
					var o = Gi(e);
					return i
				}

				function Zi(e) {
					return function(t, n, r) {
						var i = oc(t);
						if (!za(t)) {
							var o = mo(n, 3);
							t = Pu(t), n = function(e) {
								return o(i[e], e, i)
							}
						}
						var s = e(t, n, r);
						return s > -1 ? i[o ? t[s] : s] : Q
					}
				}

				function Yi(e) {
					return fo(function(t) {
						var n = t.length,
							r = n,
							i = X.prototype.thru;
						for (e && t.reverse(); r--;) {
							var o = t[r];
							if ("function" != typeof o) throw new uc(re);
							if (i && !s && "wrapper" == vo(o)) var s = new X([], (!0))
						}
						for (r = s ? r : n; ++r < n;) {
							o = t[r];
							var a = vo(o),
								u = "wrapper" == a ? wp(o) : Q;
							s = u && Do(u[0]) && u[1] == (de | ce | fe | ge) && !u[4].length && 1 == u[9] ? s[vo(u[0])].apply(s, u[3]) : 1 == o.length && Do(o) ? s[a]() : s.thru(o)
						}
						return function() {
							var e = arguments,
								r = e[0];
							if (s && 1 == e.length && gf(r) && r.length >= te) return s.plant(r).value();
							for (var i = 0, o = n ? t[i].apply(this, e) : r; ++i < n;) o = t[i].call(this, o);
							return o
						}
					})
				}

				function Xi(e, t, n, r, i, o, s, a, u, l) {
					function c() {
						for (var y = arguments.length, m = ec(y), b = y; b--;) m[b] = arguments[b];
						if (d) var x = yo(c),
							w = D(m, x);
						if (r && (m = Di(m, r, i, d)), o && (m = Mi(m, o, s, d)), y -= w, d && y < l) {
							var _ = U(m, x);
							return oo(e, t, Xi, c.placeholder, n, m, _, a, u, l - y)
						}
						var k = f ? n : this,
							T = h ? k[e] : e;
						return y = m.length, a ? m = Go(m, a) : g && y > 1 && m.reverse(), p && u < y && (m.length = u), this && this !== Xn && this instanceof c && (T = v || Gi(T)), T.apply(k, m)
					}
					var p = t & de,
						f = t & ae,
						h = t & ue,
						d = t & (ce | pe),
						g = t & ve,
						v = h ? Q : Gi(e);
					return c
				}

				function Ki(e, t) {
					return function(n, r) {
						return Tr(n, e, t(r), {})
					}
				}

				function Qi(e, t) {
					return function(n, r) {
						var i;
						if (n === Q && r === Q) return t;
						if (n !== Q && (i = n), r !== Q) {
							if (i === Q) return r;
							"string" == typeof n || "string" == typeof r ? (n = hi(n), r = hi(r)) : (n = fi(n), r = fi(r)), i = e(n, r)
						}
						return i
					}
				}

				function eo(e) {
					return fo(function(t) {
						return t = c(t, O(mo())), ni(function(r) {
							var i = this;
							return e(t, function(e) {
								return n(e, i, r)
							})
						})
					})
				}

				function to(e, t) {
					t = t === Q ? " " : hi(t);
					var n = t.length;
					if (n < 2) return n ? ti(t, e) : t;
					var r = ti(t, Mc(e / J(t)));
					return P(t) ? Ti(Z(r), 0, e).join("") : r.slice(0, e)
				}

				function no(e, t, r, i) {
					function o() {
						for (var t = -1, u = arguments.length, l = -1, c = i.length, p = ec(c + u), f = this && this !== Xn && this instanceof o ? a : e; ++l < c;) p[l] = i[l];
						for (; u--;) p[l++] = arguments[++t];
						return n(f, s ? r : this, p)
					}
					var s = t & ae,
						a = Gi(e);
					return o
				}

				function ro(e) {
					return function(t, n, r) {
						return r && "number" != typeof r && Ro(t, n, r) && (n = r = Q), t = bu(t), n === Q ? (n = t, t = 0) : n = bu(n), r = r === Q ? t < n ? 1 : -1 : bu(r), ei(t, n, r, e)
					}
				}

				function io(e) {
					return function(t, n) {
						return "string" == typeof t && "string" == typeof n || (t = _u(t), n = _u(n)), e(t, n)
					}
				}

				function oo(e, t, n, r, i, o, s, a, u, l) {
					var c = t & ce,
						p = c ? s : Q,
						f = c ? Q : s,
						h = c ? o : Q,
						d = c ? Q : o;
					t |= c ? fe : he, t &= ~(c ? he : fe), t & le || (t &= ~(ae | ue));
					var g = [e, t, i, h, p, d, f, a, u, l],
						v = n.apply(Q, g);
					return Do(e) && Cp(v, g), v.placeholder = r, Jo(v, e, t)
				}

				function so(e) {
					var t = ic[e];
					return function(e, n) {
						if (e = _u(e), n = zc(xu(n), 292)) {
							var r = (Eu(e) + "e").split("e"),
								i = t(r[0] + "e" + (+r[1] + n));
							return r = (Eu(i) + "e").split("e"), +(r[0] + "e" + (+r[1] - n))
						}
						return t(e)
					}
				}

				function ao(e) {
					return function(t) {
						var n = Tp(t);
						return n == Ue ? F(t) : n == Ye ? H(t) : j(t, e(t))
					}
				}

				function uo(e, t, n, r, i, o, s, a) {
					var u = t & ue;
					if (!u && "function" != typeof e) throw new uc(re);
					var l = r ? r.length : 0;
					if (l || (t &= ~(fe | he), r = i = Q), s = s === Q ? s : Uc(xu(s), 0), a = a === Q ? a : xu(a), l -= i ? i.length : 0, t & he) {
						var c = r,
							p = i;
						r = i = Q
					}
					var f = u ? Q : wp(e),
						h = [e, t, n, r, i, c, p, o, s, a];
					if (f && Fo(h, f), e = h[0], t = h[1], n = h[2], r = h[3], i = h[4], a = h[9] = null == h[9] ? u ? 0 : e.length : Uc(h[9] - l, 0), !a && t & (ce | pe) && (t &= ~(ce | pe)), t && t != ae) d = t == ce || t == pe ? Ji(e, t, a) : t != fe && t != (ae | fe) || i.length ? Xi.apply(Q, h) : no(e, t, n, r);
					else var d = zi(e, t, n);
					var g = f ? vp : Cp;
					return Jo(g(d, h), e, t)
				}

				function lo(e, t, n, r, i, o) {
					var s = i & me,
						a = e.length,
						u = t.length;
					if (a != u && !(s && u > a)) return !1;
					var l = o.get(e);
					if (l && o.get(t)) return l == t;
					var c = -1,
						p = !0,
						f = i & ye ? new gn : Q;
					for (o.set(e, t), o.set(t, e); ++c < a;) {
						var h = e[c],
							g = t[c];
						if (r) var v = s ? r(g, h, c, t, e, o) : r(h, g, c, e, t, o);
						if (v !== Q) {
							if (v) continue;
							p = !1;
							break
						}
						if (f) {
							if (!d(t, function(e, t) {
									if (!R(f, t) && (h === e || n(h, e, r, i, o))) return f.push(t)
								})) {
								p = !1;
								break
							}
						} else if (h !== g && !n(h, g, r, i, o)) {
							p = !1;
							break
						}
					}
					return o.delete(e), o.delete(t), p
				}

				function co(e, t, n, r, i, o, s) {
					switch (n) {
						case rt:
							if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
							e = e.buffer, t = t.buffer;
						case nt:
							return !(e.byteLength != t.byteLength || !r(new kc(e), new kc(t)));
						case Le:
						case Pe:
						case ze:
							return Ua(+e, +t);
						case qe:
							return e.name == t.name && e.message == t.message;
						case Ze:
						case Xe:
							return e == t + "";
						case Ue:
							var a = F;
						case Ye:
							var u = o & me;
							if (a || (a = z), e.size != t.size && !u) return !1;
							var l = s.get(e);
							if (l) return l == t;
							o |= ye, s.set(e, t);
							var c = lo(a(e), a(t), r, i, o, s);
							return s.delete(e), c;
						case Ke:
							if (lp) return lp.call(e) == lp.call(t)
					}
					return !1
				}

				function po(e, t, n, r, i, o) {
					var s = i & me,
						a = Pu(e),
						u = a.length,
						l = Pu(t),
						c = l.length;
					if (u != c && !s) return !1;
					for (var p = u; p--;) {
						var f = a[p];
						if (!(s ? f in t : dc.call(t, f))) return !1
					}
					var h = o.get(e);
					if (h && o.get(t)) return h == t;
					var d = !0;
					o.set(e, t), o.set(t, e);
					for (var g = s; ++p < u;) {
						f = a[p];
						var v = e[f],
							y = t[f];
						if (r) var m = s ? r(y, v, f, t, e, o) : r(v, y, f, e, t, o);
						if (!(m === Q ? v === y || n(v, y, r, i, o) : m)) {
							d = !1;
							break
						}
						g || (g = "constructor" == f)
					}
					if (d && !g) {
						var b = e.constructor,
							x = t.constructor;
						b != x && "constructor" in e && "constructor" in t && !("function" == typeof b && b instanceof b && "function" == typeof x && x instanceof x) && (d = !1)
					}
					return o.delete(e), o.delete(t), d
				}

				function fo(e) {
					return Sp(Ho(e, Q, ps), e + "")
				}

				function ho(e) {
					return yr(e, Pu, _p)
				}

				function go(e) {
					return yr(e, Bu, kp)
				}

				function vo(e) {
					for (var t = e.name + "", n = np[t], r = dc.call(np, t) ? n.length : 0; r--;) {
						var i = n[r],
							o = i.func;
						if (null == o || o == e) return i.name
					}
					return t
				}

				function yo(e) {
					var t = dc.call(W, "placeholder") ? W : e;
					return t.placeholder
				}

				function mo() {
					var e = W.iteratee || jl;
					return e = e === jl ? Lr : e, arguments.length ? e(arguments[0], arguments[1]) : e
				}

				function bo(e, t) {
					var n = e.__data__;
					return $o(t) ? n["string" == typeof t ? "string" : "hash"] : n.map
				}

				function xo(e) {
					for (var t = Pu(e), n = t.length; n--;) {
						var r = t[n],
							i = e[r];
						t[n] = [r, i, Po(i)]
					}
					return t
				}

				function wo(e, t) {
					var n = L(e, t);
					return Nr(n) ? n : Q
				}

				function _o(e) {
					var t = dc.call(e, Ic),
						n = e[Ic];
					try {
						e[Ic] = Q;
						var r = !0
					} catch (e) {}
					var i = yc.call(e);
					return r && (t ? e[Ic] = n : delete e[Ic]), i
				}

				function ko(e, t, n) {
					for (var r = -1, i = n.length; ++r < i;) {
						var o = n[r],
							s = o.size;
						switch (o.type) {
							case "drop":
								e += s;
								break;
							case "dropRight":
								t -= s;
								break;
							case "take":
								t = zc(t, e + s);
								break;
							case "takeRight":
								e = Uc(e, t - s)
						}
					}
					return {
						start: e,
						end: t
					}
				}

				function To(e) {
					var t = e.match(Nt);
					return t ? t[1].split($t) : []
				}

				function Eo(e, t, n) {
					t = No(t, e) ? [t] : ki(t);
					for (var r = -1, i = t.length, o = !1; ++r < i;) {
						var s = Xo(t[r]);
						if (!(o = null != e && n(e, s))) break;
						e = e[s]
					}
					return o || ++r != i ? o : (i = null == e ? 0 : e.length, !!i && tu(i) && Io(s, i) && (gf(e) || df(e)))
				}

				function Co(e) {
					var t = e.length,
						n = e.constructor(t);
					return t && "string" == typeof e[0] && dc.call(e, "index") && (n.index = e.index, n.input = e.input), n
				}

				function Ao(e) {
					return "function" != typeof e.constructor || Lo(e) ? {} : pp(Ec(e))
				}

				function So(e, t, n, r) {
					var i = e.constructor;
					switch (t) {
						case nt:
							return Ci(e);
						case Le:
						case Pe:
							return new i((+e));
						case rt:
							return Ai(e, r);
						case it:
						case ot:
						case st:
						case at:
						case ut:
						case lt:
						case ct:
						case pt:
						case ft:
							return Ri(e, r);
						case Ue:
							return Si(e, r, n);
						case ze:
						case Xe:
							return new i(e);
						case Ze:
							return ji(e);
						case Ye:
							return Oi(e, r, n);
						case Ke:
							return Ii(e)
					}
				}

				function jo(e, t) {
					var n = t.length;
					if (!n) return e;
					var r = n - 1;
					return t[r] = (n > 1 ? "& " : "") + t[r], t = t.join(n > 2 ? ", " : " "), e.replace(Rt, "{\n/* [wrapped with " + t + "] */\n")
				}

				function Oo(e) {
					return gf(e) || df(e) || !!(jc && e && e[jc])
				}

				function Io(e, t) {
					return t = null == t ? Ae : t, !!t && ("number" == typeof e || Ut.test(e)) && e > -1 && e % 1 == 0 && e < t
				}

				function Ro(e, t, n) {
					if (!nu(n)) return !1;
					var r = typeof t;
					return !!("number" == r ? za(n) && Io(t, n.length) : "string" == r && t in n) && Ua(n[t], e)
				}

				function No(e, t) {
					if (gf(e)) return !1;
					var n = typeof e;
					return !("number" != n && "symbol" != n && "boolean" != n && null != e && !du(e)) || Tt.test(e) || !kt.test(e) || null != t && e in oc(t)
				}

				function $o(e) {
					var t = typeof e;
					return "string" == t || "number" == t || "symbol" == t || "boolean" == t ? "__proto__" !== e : null === e
				}

				function Do(e) {
					var t = vo(e),
						n = W[t];
					if ("function" != typeof n || !(t in Dt.prototype)) return !1;
					if (e === n) return !0;
					var r = wp(n);
					return !!r && e === r[0]
				}

				function Mo(e) {
					return !!vc && vc in e
				}

				function Lo(e) {
					var t = e && e.constructor,
						n = "function" == typeof t && t.prototype || pc;
					return e === n
				}

				function Po(e) {
					return e === e && !nu(e)
				}

				function Bo(e, t) {
					return function(n) {
						return null != n && n[e] === t && (t !== Q || e in oc(n))
					}
				}

				function qo(e) {
					var t = ja(e, function(e) {
							return n.size === oe && n.clear(), e
						}),
						n = t.cache;
					return t
				}

				function Fo(e, t) {
					var n = e[1],
						r = t[1],
						i = n | r,
						o = i < (ae | ue | de),
						s = r == de && n == ce || r == de && n == ge && e[7].length <= t[8] || r == (de | ge) && t[7].length <= t[8] && n == ce;
					if (!o && !s) return e;
					r & ae && (e[2] = t[2], i |= n & ae ? 0 : le);
					var a = t[3];
					if (a) {
						var u = e[3];
						e[3] = u ? Di(u, a, t[4]) : a, e[4] = u ? U(e[3], se) : t[4]
					}
					return a = t[5], a && (u = e[5], e[5] = u ? Mi(u, a, t[6]) : a, e[6] = u ? U(e[5], se) : t[6]), a = t[7], a && (e[7] = a), r & de && (e[8] = null == e[8] ? t[8] : zc(e[8], t[8])), null == e[9] && (e[9] = t[9]), e[0] = t[0], e[1] = i, e
				}

				function Vo(e, t, n, r, i, o) {
					return nu(e) && nu(t) && (o.set(t, e), zr(e, t, Q, Vo, o), o.delete(t)), e
				}

				function Uo(e) {
					var t = [];
					if (null != e)
						for (var n in oc(e)) t.push(n);
					return t
				}

				function zo(e) {
					return yc.call(e)
				}

				function Ho(e, t, r) {
					return t = Uc(t === Q ? e.length - 1 : t, 0),
						function() {
							for (var i = arguments, o = -1, s = Uc(i.length - t, 0), a = ec(s); ++o < s;) a[o] = i[t + o];
							o = -1;
							for (var u = ec(t + 1); ++o < t;) u[o] = i[o];
							return u[t] = r(a), n(e, this, u)
						}
				}

				function Wo(e, t) {
					return 1 == t.length ? e : vr(e, ai(t, 0, -1))
				}

				function Go(e, t) {
					for (var n = e.length, r = zc(t.length, n), i = Li(e); r--;) {
						var o = t[r];
						e[r] = Io(o, n) ? i[o] : Q
					}
					return e
				}

				function Jo(e, t, n) {
					var r = t + "";
					return Sp(e, jo(r, Qo(To(r), n)))
				}

				function Zo(e) {
					var t = 0,
						n = 0;
					return function() {
						var r = Hc(),
							i = _e - (r - n);
						if (n = r, i > 0) {
							if (++t >= we) return arguments[0]
						} else t = 0;
						return e.apply(Q, arguments)
					}
				}

				function Yo(e, t) {
					var n = -1,
						r = e.length,
						i = r - 1;
					for (t = t === Q ? r : t; ++n < t;) {
						var o = Qr(n, i),
							s = e[o];
						e[o] = e[n], e[n] = s
					}
					return e.length = t, e
				}

				function Xo(e) {
					if ("string" == typeof e || du(e)) return e;
					var t = e + "";
					return "0" == t && 1 / e == -Ce ? "-0" : t
				}

				function Ko(e) {
					if (null != e) {
						try {
							return hc.call(e)
						} catch (e) {}
						try {
							return e + ""
						} catch (e) {}
					}
					return ""
				}

				function Qo(e, t) {
					return i(Ne, function(n) {
						var r = "_." + n[0];
						t & n[1] && !u(e, r) && e.push(r)
					}), e.sort()
				}

				function es(e) {
					if (e instanceof Dt) return e.clone();
					var t = new X(e.__wrapped__, e.__chain__);
					return t.__actions__ = Li(e.__actions__), t.__index__ = e.__index__, t.__values__ = e.__values__, t
				}

				function ts(e, t, n) {
					t = (n ? Ro(e, t, n) : t === Q) ? 1 : Uc(xu(t), 0);
					var r = null == e ? 0 : e.length;
					if (!r || t < 1) return [];
					for (var i = 0, o = 0, s = ec(Mc(r / t)); i < r;) s[o++] = ai(e, i, i += t);
					return s
				}

				function ns(e) {
					for (var t = -1, n = null == e ? 0 : e.length, r = 0, i = []; ++t < n;) {
						var o = e[t];
						o && (i[r++] = o)
					}
					return i
				}

				function rs() {
					var e = arguments.length;
					if (!e) return [];
					for (var t = ec(e - 1), n = arguments[0], r = e; r--;) t[r - 1] = arguments[r];
					return p(gf(n) ? Li(n) : [n], nr(t, 1))
				}

				function is(e, t, n) {
					var r = null == e ? 0 : e.length;
					return r ? (t = n || t === Q ? 1 : xu(t), ai(e, t < 0 ? 0 : t, r)) : []
				}

				function os(e, t, n) {
					var r = null == e ? 0 : e.length;
					return r ? (t = n || t === Q ? 1 : xu(t), t = r - t, ai(e, 0, t < 0 ? 0 : t)) : []
				}

				function ss(e, t) {
					return e && e.length ? yi(e, mo(t, 3), !0, !0) : []
				}

				function as(e, t) {
					return e && e.length ? yi(e, mo(t, 3), !0) : []
				}

				function us(e, t, n, r) {
					var i = null == e ? 0 : e.length;
					return i ? (n && "number" != typeof n && Ro(e, t, n) && (n = 0, r = i), Qn(e, t, n, r)) : []
				}

				function ls(e, t, n) {
					var r = null == e ? 0 : e.length;
					if (!r) return -1;
					var i = null == n ? 0 : xu(n);
					return i < 0 && (i = Uc(r + i, 0)), m(e, mo(t, 3), i)
				}

				function cs(e, t, n) {
					var r = null == e ? 0 : e.length;
					if (!r) return -1;
					var i = r - 1;
					return n !== Q && (i = xu(n), i = n < 0 ? Uc(r + i, 0) : zc(i, r - 1)), m(e, mo(t, 3), i, !0)
				}

				function ps(e) {
					var t = null == e ? 0 : e.length;
					return t ? nr(e, 1) : []
				}

				function fs(e) {
					var t = null == e ? 0 : e.length;
					return t ? nr(e, Ce) : []
				}

				function hs(e, t) {
					var n = null == e ? 0 : e.length;
					return n ? (t = t === Q ? 1 : xu(t), nr(e, t)) : []
				}

				function ds(e) {
					for (var t = -1, n = null == e ? 0 : e.length, r = {}; ++t < n;) {
						var i = e[t];
						r[i[0]] = i[1]
					}
					return r
				}

				function gs(e) {
					return e && e.length ? e[0] : Q
				}

				function vs(e, t, n) {
					var r = null == e ? 0 : e.length;
					if (!r) return -1;
					var i = null == n ? 0 : xu(n);
					return i < 0 && (i = Uc(r + i, 0)), b(e, t, i)
				}

				function ys(e) {
					var t = null == e ? 0 : e.length;
					return t ? ai(e, 0, -1) : []
				}

				function ms(e, t) {
					return null == e ? "" : Fc.call(e, t)
				}

				function bs(e) {
					var t = null == e ? 0 : e.length;
					return t ? e[t - 1] : Q
				}

				function xs(e, t, n) {
					var r = null == e ? 0 : e.length;
					if (!r) return -1;
					var i = r;
					return n !== Q && (i = xu(n), i = i < 0 ? Uc(r + i, 0) : zc(i, r - 1)), t === t ? G(e, t, i) : m(e, w, i, !0)
				}

				function ws(e, t) {
					return e && e.length ? Wr(e, xu(t)) : Q
				}

				function _s(e, t) {
					return e && e.length && t && t.length ? Xr(e, t) : e
				}

				function ks(e, t, n) {
					return e && e.length && t && t.length ? Xr(e, t, mo(n, 2)) : e
				}

				function Ts(e, t, n) {
					return e && e.length && t && t.length ? Xr(e, t, Q, n) : e
				}

				function Es(e, t) {
					var n = [];
					if (!e || !e.length) return n;
					var r = -1,
						i = [],
						o = e.length;
					for (t = mo(t, 3); ++r < o;) {
						var s = e[r];
						t(s, r, e) && (n.push(s), i.push(r))
					}
					return Kr(e, i), n
				}

				function Cs(e) {
					return null == e ? e : Jc.call(e)
				}

				function As(e, t, n) {
					var r = null == e ? 0 : e.length;
					return r ? (n && "number" != typeof n && Ro(e, t, n) ? (t = 0, n = r) : (t = null == t ? 0 : xu(t), n = n === Q ? r : xu(n)), ai(e, t, n)) : []
				}

				function Ss(e, t) {
					return li(e, t)
				}

				function js(e, t, n) {
					return ci(e, t, mo(n, 2))
				}

				function Os(e, t) {
					var n = null == e ? 0 : e.length;
					if (n) {
						var r = li(e, t);
						if (r < n && Ua(e[r], t)) return r
					}
					return -1
				}

				function Is(e, t) {
					return li(e, t, !0)
				}

				function Rs(e, t, n) {
					return ci(e, t, mo(n, 2), !0)
				}

				function Ns(e, t) {
					var n = null == e ? 0 : e.length;
					if (n) {
						var r = li(e, t, !0) - 1;
						if (Ua(e[r], t)) return r
					}
					return -1
				}

				function $s(e) {
					return e && e.length ? pi(e) : []
				}

				function Ds(e, t) {
					return e && e.length ? pi(e, mo(t, 2)) : []
				}

				function Ms(e) {
					var t = null == e ? 0 : e.length;
					return t ? ai(e, 1, t) : []
				}

				function Ls(e, t, n) {
					return e && e.length ? (t = n || t === Q ? 1 : xu(t), ai(e, 0, t < 0 ? 0 : t)) : []
				}

				function Ps(e, t, n) {
					var r = null == e ? 0 : e.length;
					return r ? (t = n || t === Q ? 1 : xu(t), t = r - t, ai(e, t < 0 ? 0 : t, r)) : []
				}

				function Bs(e, t) {
					return e && e.length ? yi(e, mo(t, 3), !1, !0) : []
				}

				function qs(e, t) {
					return e && e.length ? yi(e, mo(t, 3)) : []
				}

				function Fs(e) {
					return e && e.length ? di(e) : []
				}

				function Vs(e, t) {
					return e && e.length ? di(e, mo(t, 2)) : []
				}

				function Us(e, t) {
					return t = "function" == typeof t ? t : Q, e && e.length ? di(e, Q, t) : []
				}

				function zs(e) {
					if (!e || !e.length) return [];
					var t = 0;
					return e = a(e, function(e) {
						if (Ha(e)) return t = Uc(e.length, t), !0
					}), S(t, function(t) {
						return c(e, k(t))
					})
				}

				function Hs(e, t) {
					if (!e || !e.length) return [];
					var r = zs(e);
					return null == t ? r : c(r, function(e) {
						return n(t, Q, e)
					})
				}

				function Ws(e, t) {
					return xi(e || [], t || [], On)
				}

				function Gs(e, t) {
					return xi(e || [], t || [], oi)
				}

				function Js(e) {
					var t = W(e);
					return t.__chain__ = !0, t
				}

				function Zs(e, t) {
					return t(e), e
				}

				function Ys(e, t) {
					return t(e)
				}

				function Xs() {
					return Js(this)
				}

				function Ks() {
					return new X(this.value(), this.__chain__)
				}

				function Qs() {
					this.__values__ === Q && (this.__values__ = mu(this.value()));
					var e = this.__index__ >= this.__values__.length,
						t = e ? Q : this.__values__[this.__index__++];
					return {
						done: e,
						value: t
					}
				}

				function ea() {
					return this
				}

				function ta(e) {
					for (var t, n = this; n instanceof Y;) {
						var r = es(n);
						r.__index__ = 0, r.__values__ = Q, t ? i.__wrapped__ = r : t = r;
						var i = r;
						n = n.__wrapped__
					}
					return i.__wrapped__ = e, t
				}

				function na() {
					var e = this.__wrapped__;
					if (e instanceof Dt) {
						var t = e;
						return this.__actions__.length && (t = new Dt(this)), t = t.reverse(), t.__actions__.push({
							func: Ys,
							args: [Cs],
							thisArg: Q
						}), new X(t, this.__chain__)
					}
					return this.thru(Cs)
				}

				function ra() {
					return mi(this.__wrapped__, this.__actions__)
				}

				function ia(e, t, n) {
					var r = gf(e) ? s : Yn;
					return n && Ro(e, t, n) && (t = Q), r(e, mo(t, 3))
				}

				function oa(e, t) {
					var n = gf(e) ? a : tr;
					return n(e, mo(t, 3))
				}

				function sa(e, t) {
					return nr(fa(e, t), 1)
				}

				function aa(e, t) {
					return nr(fa(e, t), Ce)
				}

				function ua(e, t, n) {
					return n = n === Q ? 1 : xu(n), nr(fa(e, t), n)
				}

				function la(e, t) {
					var n = gf(e) ? i : fp;
					return n(e, mo(t, 3))
				}

				function ca(e, t) {
					var n = gf(e) ? o : hp;
					return n(e, mo(t, 3))
				}

				function pa(e, t, n, r) {
					e = za(e) ? e : Xu(e), n = n && !r ? xu(n) : 0;
					var i = e.length;
					return n < 0 && (n = Uc(i + n, 0)), hu(e) ? n <= i && e.indexOf(t, n) > -1 : !!i && b(e, t, n) > -1
				}

				function fa(e, t) {
					var n = gf(e) ? c : Fr;
					return n(e, mo(t, 3))
				}

				function ha(e, t, n, r) {
					return null == e ? [] : (gf(t) || (t = null == t ? [] : [t]), n = r ? Q : n, gf(n) || (n = null == n ? [] : [n]),
						Gr(e, t, n))
				}

				function da(e, t, n) {
					var r = gf(e) ? f : E,
						i = arguments.length < 3;
					return r(e, mo(t, 4), n, i, fp)
				}

				function ga(e, t, n) {
					var r = gf(e) ? h : E,
						i = arguments.length < 3;
					return r(e, mo(t, 4), n, i, hp)
				}

				function va(e, t) {
					var n = gf(e) ? a : tr;
					return n(e, Oa(mo(t, 3)))
				}

				function ya(e) {
					var t = gf(e) ? En : ri;
					return t(e)
				}

				function ma(e, t, n) {
					t = (n ? Ro(e, t, n) : t === Q) ? 1 : xu(t);
					var r = gf(e) ? Cn : ii;
					return r(e, t)
				}

				function ba(e) {
					var t = gf(e) ? An : si;
					return t(e)
				}

				function xa(e) {
					if (null == e) return 0;
					if (za(e)) return hu(e) ? J(e) : e.length;
					var t = Tp(e);
					return t == Ue || t == Ye ? e.size : Pr(e).length
				}

				function wa(e, t, n) {
					var r = gf(e) ? d : ui;
					return n && Ro(e, t, n) && (t = Q), r(e, mo(t, 3))
				}

				function _a(e, t) {
					if ("function" != typeof t) throw new uc(re);
					return e = xu(e),
						function() {
							if (--e < 1) return t.apply(this, arguments)
						}
				}

				function ka(e, t, n) {
					return t = n ? Q : t, t = e && null == t ? e.length : t, uo(e, de, Q, Q, Q, Q, t)
				}

				function Ta(e, t) {
					var n;
					if ("function" != typeof t) throw new uc(re);
					return e = xu(e),
						function() {
							return --e > 0 && (n = t.apply(this, arguments)), e <= 1 && (t = Q), n
						}
				}

				function Ea(e, t, n) {
					t = n ? Q : t;
					var r = uo(e, ce, Q, Q, Q, Q, Q, t);
					return r.placeholder = Ea.placeholder, r
				}

				function Ca(e, t, n) {
					t = n ? Q : t;
					var r = uo(e, pe, Q, Q, Q, Q, Q, t);
					return r.placeholder = Ca.placeholder, r
				}

				function Aa(e, t, n) {
					function r(t) {
						var n = f,
							r = h;
						return f = h = Q, m = t, g = e.apply(r, n)
					}

					function i(e) {
						return m = e, v = Ap(a, t), b ? r(e) : g
					}

					function o(e) {
						var n = e - y,
							r = e - m,
							i = t - n;
						return x ? zc(i, d - r) : i
					}

					function s(e) {
						var n = e - y,
							r = e - m;
						return y === Q || n >= t || n < 0 || x && r >= d
					}

					function a() {
						var e = nf();
						return s(e) ? u(e) : void(v = Ap(a, o(e)))
					}

					function u(e) {
						return v = Q, w && f ? r(e) : (f = h = Q, g)
					}

					function l() {
						v !== Q && bp(v), m = 0, f = y = h = v = Q
					}

					function c() {
						return v === Q ? g : u(nf())
					}

					function p() {
						var e = nf(),
							n = s(e);
						if (f = arguments, h = this, y = e, n) {
							if (v === Q) return i(y);
							if (x) return v = Ap(a, t), r(y)
						}
						return v === Q && (v = Ap(a, t)), g
					}
					var f, h, d, g, v, y, m = 0,
						b = !1,
						x = !1,
						w = !0;
					if ("function" != typeof e) throw new uc(re);
					return t = _u(t) || 0, nu(n) && (b = !!n.leading, x = "maxWait" in n, d = x ? Uc(_u(n.maxWait) || 0, t) : d, w = "trailing" in n ? !!n.trailing : w), p.cancel = l, p.flush = c, p
				}

				function Sa(e) {
					return uo(e, ve)
				}

				function ja(e, t) {
					if ("function" != typeof e || null != t && "function" != typeof t) throw new uc(re);
					var n = function() {
						var r = arguments,
							i = t ? t.apply(this, r) : r[0],
							o = n.cache;
						if (o.has(i)) return o.get(i);
						var s = e.apply(this, r);
						return n.cache = o.set(i, s) || o, s
					};
					return n.cache = new(ja.Cache || ln), n
				}

				function Oa(e) {
					if ("function" != typeof e) throw new uc(re);
					return function() {
						var t = arguments;
						switch (t.length) {
							case 0:
								return !e.call(this);
							case 1:
								return !e.call(this, t[0]);
							case 2:
								return !e.call(this, t[0], t[1]);
							case 3:
								return !e.call(this, t[0], t[1], t[2])
						}
						return !e.apply(this, t)
					}
				}

				function Ia(e) {
					return Ta(2, e)
				}

				function Ra(e, t) {
					if ("function" != typeof e) throw new uc(re);
					return t = t === Q ? t : xu(t), ni(e, t)
				}

				function Na(e, t) {
					if ("function" != typeof e) throw new uc(re);
					return t = t === Q ? 0 : Uc(xu(t), 0), ni(function(r) {
						var i = r[t],
							o = Ti(r, 0, t);
						return i && p(o, i), n(e, this, o)
					})
				}

				function $a(e, t, n) {
					var r = !0,
						i = !0;
					if ("function" != typeof e) throw new uc(re);
					return nu(n) && (r = "leading" in n ? !!n.leading : r, i = "trailing" in n ? !!n.trailing : i), Aa(e, t, {
						leading: r,
						maxWait: t,
						trailing: i
					})
				}

				function Da(e) {
					return ka(e, 1)
				}

				function Ma(e, t) {
					return lf(_i(t), e)
				}

				function La() {
					if (!arguments.length) return [];
					var e = arguments[0];
					return gf(e) ? e : [e]
				}

				function Pa(e) {
					return Un(e, !1, !0)
				}

				function Ba(e, t) {
					return t = "function" == typeof t ? t : Q, Un(e, !1, !0, t)
				}

				function qa(e) {
					return Un(e, !0, !0)
				}

				function Fa(e, t) {
					return t = "function" == typeof t ? t : Q, Un(e, !0, !0, t)
				}

				function Va(e, t) {
					return null == t || Hn(e, t, Pu(t))
				}

				function Ua(e, t) {
					return e === t || e !== e && t !== t
				}

				function za(e) {
					return null != e && tu(e.length) && !Qa(e)
				}

				function Ha(e) {
					return ru(e) && za(e)
				}

				function Wa(e) {
					return e === !0 || e === !1 || ru(e) && mr(e) == Le
				}

				function Ga(e) {
					return ru(e) && 1 === e.nodeType && !pu(e)
				}

				function Ja(e) {
					if (null == e) return !0;
					if (za(e) && (gf(e) || "string" == typeof e || "function" == typeof e.splice || yf(e) || _f(e) || df(e))) return !e.length;
					var t = Tp(e);
					if (t == Ue || t == Ye) return !e.size;
					if (Lo(e)) return !Pr(e).length;
					for (var n in e)
						if (dc.call(e, n)) return !1;
					return !0
				}

				function Za(e, t) {
					return jr(e, t)
				}

				function Ya(e, t, n) {
					n = "function" == typeof n ? n : Q;
					var r = n ? n(e, t) : Q;
					return r === Q ? jr(e, t, n) : !!r
				}

				function Xa(e) {
					if (!ru(e)) return !1;
					var t = mr(e);
					return t == qe || t == Be || "string" == typeof e.message && "string" == typeof e.name && !pu(e)
				}

				function Ka(e) {
					return "number" == typeof e && qc(e)
				}

				function Qa(e) {
					if (!nu(e)) return !1;
					var t = mr(e);
					return t == Fe || t == Ve || t == Me || t == Je
				}

				function eu(e) {
					return "number" == typeof e && e == xu(e)
				}

				function tu(e) {
					return "number" == typeof e && e > -1 && e % 1 == 0 && e <= Ae
				}

				function nu(e) {
					var t = typeof e;
					return null != e && ("object" == t || "function" == t)
				}

				function ru(e) {
					return null != e && "object" == typeof e
				}

				function iu(e, t) {
					return e === t || Rr(e, t, xo(t))
				}

				function ou(e, t, n) {
					return n = "function" == typeof n ? n : Q, Rr(e, t, xo(t), n)
				}

				function su(e) {
					return cu(e) && e != +e
				}

				function au(e) {
					if (Ep(e)) throw new nc(ne);
					return Nr(e)
				}

				function uu(e) {
					return null === e
				}

				function lu(e) {
					return null == e
				}

				function cu(e) {
					return "number" == typeof e || ru(e) && mr(e) == ze
				}

				function pu(e) {
					if (!ru(e) || mr(e) != We) return !1;
					var t = Ec(e);
					if (null === t) return !0;
					var n = dc.call(t, "constructor") && t.constructor;
					return "function" == typeof n && n instanceof n && hc.call(n) == mc
				}

				function fu(e) {
					return eu(e) && e >= -Ae && e <= Ae
				}

				function hu(e) {
					return "string" == typeof e || !gf(e) && ru(e) && mr(e) == Xe
				}

				function du(e) {
					return "symbol" == typeof e || ru(e) && mr(e) == Ke
				}

				function gu(e) {
					return e === Q
				}

				function vu(e) {
					return ru(e) && Tp(e) == et
				}

				function yu(e) {
					return ru(e) && mr(e) == tt
				}

				function mu(e) {
					if (!e) return [];
					if (za(e)) return hu(e) ? Z(e) : Li(e);
					if (Oc && e[Oc]) return q(e[Oc]());
					var t = Tp(e),
						n = t == Ue ? F : t == Ye ? z : Xu;
					return n(e)
				}

				function bu(e) {
					if (!e) return 0 === e ? e : 0;
					if (e = _u(e), e === Ce || e === -Ce) {
						var t = e < 0 ? -1 : 1;
						return t * Se
					}
					return e === e ? e : 0
				}

				function xu(e) {
					var t = bu(e),
						n = t % 1;
					return t === t ? n ? t - n : t : 0
				}

				function wu(e) {
					return e ? Pn(xu(e), 0, Oe) : 0
				}

				function _u(e) {
					if ("number" == typeof e) return e;
					if (du(e)) return je;
					if (nu(e)) {
						var t = "function" == typeof e.valueOf ? e.valueOf() : e;
						e = nu(t) ? t + "" : t
					}
					if ("string" != typeof e) return 0 === e ? e : +e;
					e = e.replace(jt, "");
					var n = qt.test(e);
					return n || Vt.test(e) ? Jn(e.slice(2), n ? 2 : 8) : Bt.test(e) ? je : +e
				}

				function ku(e) {
					return Pi(e, Bu(e))
				}

				function Tu(e) {
					return Pn(xu(e), -Ae, Ae)
				}

				function Eu(e) {
					return null == e ? "" : hi(e)
				}

				function Cu(e, t) {
					var n = pp(e);
					return null == t ? n : Dn(n, t)
				}

				function Au(e, t) {
					return y(e, mo(t, 3), lr)
				}

				function Su(e, t) {
					return y(e, mo(t, 3), hr)
				}

				function ju(e, t) {
					return null == e ? e : dp(e, mo(t, 3), Bu)
				}

				function Ou(e, t) {
					return null == e ? e : gp(e, mo(t, 3), Bu)
				}

				function Iu(e, t) {
					return e && lr(e, mo(t, 3))
				}

				function Ru(e, t) {
					return e && hr(e, mo(t, 3))
				}

				function Nu(e) {
					return null == e ? [] : gr(e, Pu(e))
				}

				function $u(e) {
					return null == e ? [] : gr(e, Bu(e))
				}

				function Du(e, t, n) {
					var r = null == e ? Q : vr(e, t);
					return r === Q ? n : r
				}

				function Mu(e, t) {
					return null != e && Eo(e, t, xr)
				}

				function Lu(e, t) {
					return null != e && Eo(e, t, wr)
				}

				function Pu(e) {
					return za(e) ? Tn(e) : Pr(e)
				}

				function Bu(e) {
					return za(e) ? Tn(e, !0) : Br(e)
				}

				function qu(e, t) {
					var n = {};
					return t = mo(t, 3), lr(e, function(e, r, i) {
						Mn(n, t(e, r, i), e)
					}), n
				}

				function Fu(e, t) {
					var n = {};
					return t = mo(t, 3), lr(e, function(e, r, i) {
						Mn(n, r, t(e, r, i))
					}), n
				}

				function Vu(e, t) {
					return Uu(e, Oa(mo(t)))
				}

				function Uu(e, t) {
					return null == e ? {} : Zr(e, go(e), mo(t))
				}

				function zu(e, t, n) {
					t = No(t, e) ? [t] : ki(t);
					var r = -1,
						i = t.length;
					for (i || (e = Q, i = 1); ++r < i;) {
						var o = null == e ? Q : e[Xo(t[r])];
						o === Q && (r = i, o = n), e = Qa(o) ? o.call(e) : o
					}
					return e
				}

				function Hu(e, t, n) {
					return null == e ? e : oi(e, t, n)
				}

				function Wu(e, t, n, r) {
					return r = "function" == typeof r ? r : Q, null == e ? e : oi(e, t, n, r)
				}

				function Gu(e, t, n) {
					var r = gf(e),
						o = r || yf(e) || _f(e);
					if (t = mo(t, 4), null == n) {
						var s = e && e.constructor;
						n = o ? r ? new s : [] : nu(e) && Qa(s) ? pp(Ec(e)) : {}
					}
					return (o ? i : lr)(e, function(e, r, i) {
						return t(n, e, r, i)
					}), n
				}

				function Ju(e, t) {
					return null == e || gi(e, t)
				}

				function Zu(e, t, n) {
					return null == e ? e : vi(e, t, _i(n))
				}

				function Yu(e, t, n, r) {
					return r = "function" == typeof r ? r : Q, null == e ? e : vi(e, t, _i(n), r)
				}

				function Xu(e) {
					return null == e ? [] : I(e, Pu(e))
				}

				function Ku(e) {
					return null == e ? [] : I(e, Bu(e))
				}

				function Qu(e, t, n) {
					return n === Q && (n = t, t = Q), n !== Q && (n = _u(n), n = n === n ? n : 0), t !== Q && (t = _u(t), t = t === t ? t : 0), Pn(_u(e), t, n)
				}

				function el(e, t, n) {
					return t = bu(t), n === Q ? (n = t, t = 0) : n = bu(n), e = _u(e), _r(e, t, n)
				}

				function tl(e, t, n) {
					if (n && "boolean" != typeof n && Ro(e, t, n) && (t = n = Q), n === Q && ("boolean" == typeof t ? (n = t, t = Q) : "boolean" == typeof e && (n = e, e = Q)), e === Q && t === Q ? (e = 0, t = 1) : (e = bu(e), t === Q ? (t = e, e = 0) : t = bu(t)), e > t) {
						var r = e;
						e = t, t = r
					}
					if (n || e % 1 || t % 1) {
						var i = Gc();
						return zc(e + i * (t - e + Gn("1e-" + ((i + "").length - 1))), t)
					}
					return Qr(e, t)
				}

				function nl(e) {
					return Jf(Eu(e).toLowerCase())
				}

				function rl(e) {
					return e = Eu(e), e && e.replace(zt, cr).replace($n, "")
				}

				function il(e, t, n) {
					e = Eu(e), t = hi(t);
					var r = e.length;
					n = n === Q ? r : Pn(xu(n), 0, r);
					var i = n;
					return n -= t.length, n >= 0 && e.slice(n, i) == t
				}

				function ol(e) {
					return e = Eu(e), e && bt.test(e) ? e.replace(yt, pr) : e
				}

				function sl(e) {
					return e = Eu(e), e && St.test(e) ? e.replace(At, "\\'{{MAIN_SCRIPT}}'") : e
				}

				function al(e, t, n) {
					e = Eu(e), t = xu(t);
					var r = t ? J(e) : 0;
					if (!t || r >= t) return e;
					var i = (t - r) / 2;
					return to(Lc(i), n) + e + to(Mc(i), n)
				}

				function ul(e, t, n) {
					e = Eu(e), t = xu(t);
					var r = t ? J(e) : 0;
					return t && r < t ? e + to(t - r, n) : e
				}

				function ll(e, t, n) {
					e = Eu(e), t = xu(t);
					var r = t ? J(e) : 0;
					return t && r < t ? to(t - r, n) + e : e
				}

				function cl(e, t, n) {
					return n || null == t ? t = 0 : t && (t = +t), Wc(Eu(e).replace(Ot, ""), t || 0)
				}

				function pl(e, t, n) {
					return t = (n ? Ro(e, t, n) : t === Q) ? 1 : xu(t), ti(Eu(e), t)
				}

				function fl() {
					var e = arguments,
						t = Eu(e[0]);
					return e.length < 3 ? t : t.replace(e[1], e[2])
				}

				function hl(e, t, n) {
					return n && "number" != typeof n && Ro(e, t, n) && (t = n = Q), (n = n === Q ? Oe : n >>> 0) ? (e = Eu(e), e && ("string" == typeof t || null != t && !xf(t)) && (t = hi(t), !t && P(e)) ? Ti(Z(e), 0, n) : e.split(t, n)) : []
				}

				function dl(e, t, n) {
					return e = Eu(e), n = Pn(xu(n), 0, e.length), t = hi(t), e.slice(n, n + t.length) == t
				}

				function gl(e, t, n) {
					var r = W.templateSettings;
					n && Ro(e, t, n) && (t = Q), e = Eu(e), t = Af({}, t, r, Sn);
					var i, o, s = Af({}, t.imports, r.imports, Sn),
						a = Pu(s),
						u = I(s, a),
						l = 0,
						c = t.interpolate || Ht,
						p = "__p += '",
						f = sc((t.escape || Ht).source + "|" + c.source + "|" + (c === _t ? Lt : Ht).source + "|" + (t.evaluate || Ht).source + "|$", "g"),
						h = "//# sourceURL=" + ("sourceURL" in t ? t.sourceURL : "lodash.templateSources[" + ++qn + "]") + "\n";
					e.replace(f, function(t, n, r, s, a, u) {
						return r || (r = s), p += e.slice(l, u).replace(Wt, M), n && (i = !0, p += "' +\n__e(" + n + ") +\n'"), a && (o = !0, p += "';\n" + a + ";\n__p += '"), r && (p += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'"), l = u + t.length, t
					}), p += "';\n";
					var d = t.variable;
					d || (p = "with (obj) {\n" + p + "\n}\n"), p = (o ? p.replace(ht, "") : p).replace(dt, "$1").replace(gt, "$1;"), p = "function(" + (d || "obj") + ") {\n" + (d ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (i ? ", __e = _.escape" : "") + (o ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + p + "return __p\n}";
					var g = Zf(function() {
						return rc(a, h + "return " + p).apply(Q, u)
					});
					if (g.source = p, Xa(g)) throw g;
					return g
				}

				function vl(e) {
					return Eu(e).toLowerCase()
				}

				function yl(e) {
					return Eu(e).toUpperCase()
				}

				function ml(e, t, n) {
					if (e = Eu(e), e && (n || t === Q)) return e.replace(jt, "");
					if (!e || !(t = hi(t))) return e;
					var r = Z(e),
						i = Z(t),
						o = N(r, i),
						s = $(r, i) + 1;
					return Ti(r, o, s).join("")
				}

				function bl(e, t, n) {
					if (e = Eu(e), e && (n || t === Q)) return e.replace(It, "");
					if (!e || !(t = hi(t))) return e;
					var r = Z(e),
						i = $(r, Z(t)) + 1;
					return Ti(r, 0, i).join("")
				}

				function xl(e, t, n) {
					if (e = Eu(e), e && (n || t === Q)) return e.replace(Ot, "");
					if (!e || !(t = hi(t))) return e;
					var r = Z(e),
						i = N(r, Z(t));
					return Ti(r, i).join("")
				}

				function wl(e, t) {
					var n = be,
						r = xe;
					if (nu(t)) {
						var i = "separator" in t ? t.separator : i;
						n = "length" in t ? xu(t.length) : n, r = "omission" in t ? hi(t.omission) : r
					}
					e = Eu(e);
					var o = e.length;
					if (P(e)) {
						var s = Z(e);
						o = s.length
					}
					if (n >= o) return e;
					var a = n - J(r);
					if (a < 1) return r;
					var u = s ? Ti(s, 0, a).join("") : e.slice(0, a);
					if (i === Q) return u + r;
					if (s && (a += u.length - a), xf(i)) {
						if (e.slice(a).search(i)) {
							var l, c = u;
							for (i.global || (i = sc(i.source, Eu(Pt.exec(i)) + "g")), i.lastIndex = 0; l = i.exec(c);) var p = l.index;
							u = u.slice(0, p === Q ? a : p)
						}
					} else if (e.indexOf(hi(i), a) != a) {
						var f = u.lastIndexOf(i);
						f > -1 && (u = u.slice(0, f))
					}
					return u + r
				}

				function _l(e) {
					return e = Eu(e), e && mt.test(e) ? e.replace(vt, fr) : e
				}

				function kl(e, t, n) {
					return e = Eu(e), t = n ? Q : t, t === Q ? B(e) ? K(e) : v(e) : e.match(t) || []
				}

				function Tl(e) {
					var t = null == e ? 0 : e.length,
						r = mo();
					return e = t ? c(e, function(e) {
						if ("function" != typeof e[1]) throw new uc(re);
						return [r(e[0]), e[1]]
					}) : [], ni(function(r) {
						for (var i = -1; ++i < t;) {
							var o = e[i];
							if (n(o[0], this, r)) return n(o[1], this, r)
						}
					})
				}

				function El(e) {
					return zn(Un(e, !0))
				}

				function Cl(e) {
					return function() {
						return e
					}
				}

				function Al(e, t) {
					return null == e || e !== e ? t : e
				}

				function Sl(e) {
					return e
				}

				function jl(e) {
					return Lr("function" == typeof e ? e : Un(e, !0))
				}

				function Ol(e) {
					return Vr(Un(e, !0))
				}

				function Il(e, t) {
					return Ur(e, Un(t, !0))
				}

				function Rl(e, t, n) {
					var r = Pu(t),
						o = gr(t, r);
					null != n || nu(t) && (o.length || !r.length) || (n = t, t = e, e = this, o = gr(t, Pu(t)));
					var s = !(nu(n) && "chain" in n && !n.chain),
						a = Qa(e);
					return i(o, function(n) {
						var r = t[n];
						e[n] = r, a && (e.prototype[n] = function() {
							var t = this.__chain__;
							if (s || t) {
								var n = e(this.__wrapped__),
									i = n.__actions__ = Li(this.__actions__);
								return i.push({
									func: r,
									args: arguments,
									thisArg: e
								}), n.__chain__ = t, n
							}
							return r.apply(e, p([this.value()], arguments))
						})
					}), e
				}

				function Nl() {
					return Xn._ === this && (Xn._ = bc), this
				}

				function $l() {}

				function Dl(e) {
					return e = xu(e), ni(function(t) {
						return Wr(t, e)
					})
				}

				function Ml(e) {
					return No(e) ? k(Xo(e)) : Yr(e)
				}

				function Ll(e) {
					return function(t) {
						return null == e ? Q : vr(e, t)
					}
				}

				function Pl() {
					return []
				}

				function Bl() {
					return !1
				}

				function ql() {
					return {}
				}

				function Fl() {
					return ""
				}

				function Vl() {
					return !0
				}

				function Ul(e, t) {
					if (e = xu(e), e < 1 || e > Ae) return [];
					var n = Oe,
						r = zc(e, Oe);
					t = mo(t), e -= Oe;
					for (var i = S(r, t); ++n < e;) t(n);
					return i
				}

				function zl(e) {
					return gf(e) ? c(e, Xo) : du(e) ? [e] : Li(jp(e))
				}

				function Hl(e) {
					var t = ++gc;
					return Eu(e) + t
				}

				function Wl(e) {
					return e && e.length ? Kn(e, Sl, br) : Q
				}

				function Gl(e, t) {
					return e && e.length ? Kn(e, mo(t, 2), br) : Q
				}

				function Jl(e) {
					return _(e, Sl)
				}

				function Zl(e, t) {
					return _(e, mo(t, 2))
				}

				function Yl(e) {
					return e && e.length ? Kn(e, Sl, qr) : Q
				}

				function Xl(e, t) {
					return e && e.length ? Kn(e, mo(t, 2), qr) : Q
				}

				function Kl(e) {
					return e && e.length ? A(e, Sl) : 0
				}

				function Ql(e, t) {
					return e && e.length ? A(e, mo(t, 2)) : 0
				}
				T = null == T ? Xn : dr.defaults(Xn.Object(), T, dr.pick(Xn, Bn));
				var ec = T.Array,
					tc = T.Date,
					nc = T.Error,
					rc = T.Function,
					ic = T.Math,
					oc = T.Object,
					sc = T.RegExp,
					ac = T.String,
					uc = T.TypeError,
					lc = ec.prototype,
					cc = rc.prototype,
					pc = oc.prototype,
					fc = T["__core-js_shared__"],
					hc = cc.toString,
					dc = pc.hasOwnProperty,
					gc = 0,
					vc = function() {
						var e = /[^.]+$/.exec(fc && fc.keys && fc.keys.IE_PROTO || "");
						return e ? "Symbol(src)_1." + e : ""
					}(),
					yc = pc.toString,
					mc = hc.call(oc),
					bc = Xn._,
					xc = sc("^" + hc.call(dc).replace(At, "\\'{{MAIN_SCRIPT}}'").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"),
					wc = er ? T.Buffer : Q,
					_c = T.Symbol,
					kc = T.Uint8Array,
					Tc = wc ? wc.allocUnsafe : Q,
					Ec = V(oc.getPrototypeOf, oc),
					Cc = oc.create,
					Ac = pc.propertyIsEnumerable,
					Sc = lc.splice,
					jc = _c ? _c.isConcatSpreadable : Q,
					Oc = _c ? _c.iterator : Q,
					Ic = _c ? _c.toStringTag : Q,
					Rc = function() {
						try {
							var e = wo(oc, "defineProperty");
							return e({}, "", {}), e
						} catch (e) {}
					}(),
					Nc = T.clearTimeout !== Xn.clearTimeout && T.clearTimeout,
					$c = tc && tc.now !== Xn.Date.now && tc.now,
					Dc = T.setTimeout !== Xn.setTimeout && T.setTimeout,
					Mc = ic.ceil,
					Lc = ic.floor,
					Pc = oc.getOwnPropertySymbols,
					Bc = wc ? wc.isBuffer : Q,
					qc = T.isFinite,
					Fc = lc.join,
					Vc = V(oc.keys, oc),
					Uc = ic.max,
					zc = ic.min,
					Hc = tc.now,
					Wc = T.parseInt,
					Gc = ic.random,
					Jc = lc.reverse,
					Zc = wo(T, "DataView"),
					Yc = wo(T, "Map"),
					Xc = wo(T, "Promise"),
					Kc = wo(T, "Set"),
					Qc = wo(T, "WeakMap"),
					ep = wo(oc, "create"),
					tp = Qc && new Qc,
					np = {},
					rp = Ko(Zc),
					ip = Ko(Yc),
					op = Ko(Xc),
					sp = Ko(Kc),
					ap = Ko(Qc),
					up = _c ? _c.prototype : Q,
					lp = up ? up.valueOf : Q,
					cp = up ? up.toString : Q,
					pp = function() {
						function e() {}
						return function(t) {
							if (!nu(t)) return {};
							if (Cc) return Cc(t);
							e.prototype = t;
							var n = new e;
							return e.prototype = Q, n
						}
					}();
				W.templateSettings = {
					escape: xt,
					evaluate: wt,
					interpolate: _t,
					variable: "",
					imports: {
						_: W
					}
				}, W.prototype = Y.prototype, W.prototype.constructor = W, X.prototype = pp(Y.prototype), X.prototype.constructor = X, Dt.prototype = pp(Y.prototype), Dt.prototype.constructor = Dt, Yt.prototype.clear = Xt, Yt.prototype.delete = Kt, Yt.prototype.get = Qt, Yt.prototype.has = en, Yt.prototype.set = tn, nn.prototype.clear = rn, nn.prototype.delete = on, nn.prototype.get = sn, nn.prototype.has = an, nn.prototype.set = un, ln.prototype.clear = cn, ln.prototype.delete = pn, ln.prototype.get = fn, ln.prototype.has = hn, ln.prototype.set = dn, gn.prototype.add = gn.prototype.push = vn, gn.prototype.has = yn, mn.prototype.clear = bn, mn.prototype.delete = xn, mn.prototype.get = wn, mn.prototype.has = _n, mn.prototype.set = kn;
				var fp = Vi(lr),
					hp = Vi(hr, !0),
					dp = Ui(),
					gp = Ui(!0),
					vp = tp ? function(e, t) {
						return tp.set(e, t), e
					} : Sl,
					yp = Rc ? function(e, t) {
						return Rc(e, "toString", {
							configurable: !0,
							enumerable: !1,
							value: Cl(t),
							writable: !0
						})
					} : Sl,
					mp = ni,
					bp = Nc || function(e) {
						return Xn.clearTimeout(e)
					},
					xp = Kc && 1 / z(new Kc([, -0]))[1] == Ce ? function(e) {
						return new Kc(e)
					} : $l,
					wp = tp ? function(e) {
						return tp.get(e)
					} : $l,
					_p = Pc ? V(Pc, oc) : Pl,
					kp = Pc ? function(e) {
						for (var t = []; e;) p(t, _p(e)), e = Ec(e);
						return t
					} : Pl,
					Tp = mr;
				(Zc && Tp(new Zc(new ArrayBuffer(1))) != rt || Yc && Tp(new Yc) != Ue || Xc && Tp(Xc.resolve()) != Ge || Kc && Tp(new Kc) != Ye || Qc && Tp(new Qc) != et) && (Tp = function(e) {
					var t = mr(e),
						n = t == We ? e.constructor : Q,
						r = n ? Ko(n) : "";
					if (r) switch (r) {
						case rp:
							return rt;
						case ip:
							return Ue;
						case op:
							return Ge;
						case sp:
							return Ye;
						case ap:
							return et
					}
					return t
				});
				var Ep = fc ? Qa : Bl,
					Cp = Zo(vp),
					Ap = Dc || function(e, t) {
						return Xn.setTimeout(e, t)
					},
					Sp = Zo(yp),
					jp = qo(function(e) {
						e = Eu(e);
						var t = [];
						return Et.test(e) && t.push(""), e.replace(Ct, function(e, n, r, i) {
							t.push(r ? i.replace(Mt, "$1") : n || e)
						}), t
					}),
					Op = ni(function(e, t) {
						return Ha(e) ? Zn(e, nr(t, 1, Ha, !0)) : []
					}),
					Ip = ni(function(e, t) {
						var n = bs(t);
						return Ha(n) && (n = Q), Ha(e) ? Zn(e, nr(t, 1, Ha, !0), mo(n, 2)) : []
					}),
					Rp = ni(function(e, t) {
						var n = bs(t);
						return Ha(n) && (n = Q), Ha(e) ? Zn(e, nr(t, 1, Ha, !0), Q, n) : []
					}),
					Np = ni(function(e) {
						var t = c(e, wi);
						return t.length && t[0] === e[0] ? kr(t) : []
					}),
					$p = ni(function(e) {
						var t = bs(e),
							n = c(e, wi);
						return t === bs(n) ? t = Q : n.pop(), n.length && n[0] === e[0] ? kr(n, mo(t, 2)) : []
					}),
					Dp = ni(function(e) {
						var t = bs(e),
							n = c(e, wi);
						return t = "function" == typeof t ? t : Q, t && n.pop(), n.length && n[0] === e[0] ? kr(n, Q, t) : []
					}),
					Mp = ni(_s),
					Lp = fo(function(e, t) {
						var n = null == e ? 0 : e.length,
							r = Ln(e, t);
						return Kr(e, c(t, function(e) {
							return Io(e, n) ? +e : e
						}).sort(Ni)), r
					}),
					Pp = ni(function(e) {
						return di(nr(e, 1, Ha, !0))
					}),
					Bp = ni(function(e) {
						var t = bs(e);
						return Ha(t) && (t = Q), di(nr(e, 1, Ha, !0), mo(t, 2))
					}),
					qp = ni(function(e) {
						var t = bs(e);
						return t = "function" == typeof t ? t : Q, di(nr(e, 1, Ha, !0), Q, t)
					}),
					Fp = ni(function(e, t) {
						return Ha(e) ? Zn(e, t) : []
					}),
					Vp = ni(function(e) {
						return bi(a(e, Ha))
					}),
					Up = ni(function(e) {
						var t = bs(e);
						return Ha(t) && (t = Q), bi(a(e, Ha), mo(t, 2))
					}),
					zp = ni(function(e) {
						var t = bs(e);
						return t = "function" == typeof t ? t : Q, bi(a(e, Ha), Q, t)
					}),
					Hp = ni(zs),
					Wp = ni(function(e) {
						var t = e.length,
							n = t > 1 ? e[t - 1] : Q;
						return n = "function" == typeof n ? (e.pop(), n) : Q, Hs(e, n)
					}),
					Gp = fo(function(e) {
						var t = e.length,
							n = t ? e[0] : 0,
							r = this.__wrapped__,
							i = function(t) {
								return Ln(t, e)
							};
						return !(t > 1 || this.__actions__.length) && r instanceof Dt && Io(n) ? (r = r.slice(n, +n + (t ? 1 : 0)), r.__actions__.push({
							func: Ys,
							args: [i],
							thisArg: Q
						}), new X(r, this.__chain__).thru(function(e) {
							return t && !e.length && e.push(Q), e
						})) : this.thru(i)
					}),
					Jp = qi(function(e, t, n) {
						dc.call(e, n) ? ++e[n] : Mn(e, n, 1)
					}),
					Zp = Zi(ls),
					Yp = Zi(cs),
					Xp = qi(function(e, t, n) {
						dc.call(e, n) ? e[n].push(t) : Mn(e, n, [t])
					}),
					Kp = ni(function(e, t, r) {
						var i = -1,
							o = "function" == typeof t,
							s = No(t),
							a = za(e) ? ec(e.length) : [];
						return fp(e, function(e) {
							var u = o ? t : s && null != e ? e[t] : Q;
							a[++i] = u ? n(u, e, r) : Er(e, t, r)
						}), a
					}),
					Qp = qi(function(e, t, n) {
						Mn(e, n, t)
					}),
					ef = qi(function(e, t, n) {
						e[n ? 0 : 1].push(t)
					}, function() {
						return [
							[],
							[]
						]
					}),
					tf = ni(function(e, t) {
						if (null == e) return [];
						var n = t.length;
						return n > 1 && Ro(e, t[0], t[1]) ? t = [] : n > 2 && Ro(t[0], t[1], t[2]) && (t = [t[0]]), Gr(e, nr(t, 1), [])
					}),
					nf = $c || function() {
						return Xn.Date.now()
					},
					rf = ni(function(e, t, n) {
						var r = ae;
						if (n.length) {
							var i = U(n, yo(rf));
							r |= fe
						}
						return uo(e, r, t, n, i)
					}),
					of = ni(function(e, t, n) {
						var r = ae | ue;
						if (n.length) {
							var i = U(n, yo( of ));
							r |= fe
						}
						return uo(t, r, e, n, i)
					}),
					sf = ni(function(e, t) {
						return Wn(e, 1, t)
					}),
					af = ni(function(e, t, n) {
						return Wn(e, _u(t) || 0, n)
					});
				ja.Cache = ln;
				var uf = mp(function(e, t) {
						t = 1 == t.length && gf(t[0]) ? c(t[0], O(mo())) : c(nr(t, 1), O(mo()));
						var r = t.length;
						return ni(function(i) {
							for (var o = -1, s = zc(i.length, r); ++o < s;) i[o] = t[o].call(this, i[o]);
							return n(e, this, i)
						})
					}),
					lf = ni(function(e, t) {
						var n = U(t, yo(lf));
						return uo(e, fe, Q, t, n)
					}),
					cf = ni(function(e, t) {
						var n = U(t, yo(cf));
						return uo(e, he, Q, t, n)
					}),
					pf = fo(function(e, t) {
						return uo(e, ge, Q, Q, Q, t)
					}),
					ff = io(br),
					hf = io(function(e, t) {
						return e >= t
					}),
					df = Cr(function() {
						return arguments
					}()) ? Cr : function(e) {
						return ru(e) && dc.call(e, "callee") && !Ac.call(e, "callee")
					},
					gf = ec.isArray,
					vf = rr ? O(rr) : Ar,
					yf = Bc || Bl,
					mf = ir ? O(ir) : Sr,
					bf = or ? O(or) : Ir,
					xf = sr ? O(sr) : $r,
					wf = ar ? O(ar) : Dr,
					_f = ur ? O(ur) : Mr,
					kf = io(qr),
					Tf = io(function(e, t) {
						return e <= t
					}),
					Ef = Fi(function(e, t) {
						if (Lo(t) || za(t)) return void Pi(t, Pu(t), e);
						for (var n in t) dc.call(t, n) && On(e, n, t[n])
					}),
					Cf = Fi(function(e, t) {
						Pi(t, Bu(t), e)
					}),
					Af = Fi(function(e, t, n, r) {
						Pi(t, Bu(t), e, r)
					}),
					Sf = Fi(function(e, t, n, r) {
						Pi(t, Pu(t), e, r)
					}),
					jf = fo(Ln),
					Of = ni(function(e) {
						return e.push(Q, Sn), n(Af, Q, e)
					}),
					If = ni(function(e) {
						return e.push(Q, Vo), n(Mf, Q, e)
					}),
					Rf = Ki(function(e, t, n) {
						e[t] = n
					}, Cl(Sl)),
					Nf = Ki(function(e, t, n) {
						dc.call(e, t) ? e[t].push(n) : e[t] = [n]
					}, mo),
					$f = ni(Er),
					Df = Fi(function(e, t, n) {
						zr(e, t, n)
					}),
					Mf = Fi(function(e, t, n, r) {
						zr(e, t, n, r)
					}),
					Lf = fo(function(e, t) {
						return null == e ? {} : (t = c(t, Xo), Jr(e, Zn(go(e), t)))
					}),
					Pf = fo(function(e, t) {
						return null == e ? {} : Jr(e, c(t, Xo))
					}),
					Bf = ao(Pu),
					qf = ao(Bu),
					Ff = Wi(function(e, t, n) {
						return t = t.toLowerCase(), e + (n ? nl(t) : t)
					}),
					Vf = Wi(function(e, t, n) {
						return e + (n ? "-" : "") + t.toLowerCase()
					}),
					Uf = Wi(function(e, t, n) {
						return e + (n ? " " : "") + t.toLowerCase()
					}),
					zf = Hi("toLowerCase"),
					Hf = Wi(function(e, t, n) {
						return e + (n ? "_" : "") + t.toLowerCase()
					}),
					Wf = Wi(function(e, t, n) {
						return e + (n ? " " : "") + Jf(t)
					}),
					Gf = Wi(function(e, t, n) {
						return e + (n ? " " : "") + t.toUpperCase()
					}),
					Jf = Hi("toUpperCase"),
					Zf = ni(function(e, t) {
						try {
							return n(e, Q, t)
						} catch (e) {
							return Xa(e) ? e : new nc(e)
						}
					}),
					Yf = fo(function(e, t) {
						return i(t, function(t) {
							t = Xo(t), Mn(e, t, rf(e[t], e))
						}), e
					}),
					Xf = Yi(),
					Kf = Yi(!0),
					Qf = ni(function(e, t) {
						return function(n) {
							return Er(n, e, t)
						}
					}),
					eh = ni(function(e, t) {
						return function(n) {
							return Er(e, n, t)
						}
					}),
					th = eo(c),
					nh = eo(s),
					rh = eo(d),
					ih = ro(),
					oh = ro(!0),
					sh = Qi(function(e, t) {
						return e + t
					}, 0),
					ah = so("ceil"),
					uh = Qi(function(e, t) {
						return e / t
					}, 1),
					lh = so("floor"),
					ch = Qi(function(e, t) {
						return e * t
					}, 1),
					ph = so("round"),
					fh = Qi(function(e, t) {
						return e - t
					}, 0);
				return W.after = _a, W.ary = ka, W.assign = Ef, W.assignIn = Cf, W.assignInWith = Af, W.assignWith = Sf, W.at = jf, W.before = Ta, W.bind = rf, W.bindAll = Yf, W.bindKey = of , W.castArray = La, W.chain = Js, W.chunk = ts, W.compact = ns, W.concat = rs, W.cond = Tl, W.conforms = El, W.constant = Cl, W.countBy = Jp, W.create = Cu, W.curry = Ea, W.curryRight = Ca, W.debounce = Aa, W.defaults = Of, W.defaultsDeep = If, W.defer = sf, W.delay = af, W.difference = Op, W.differenceBy = Ip, W.differenceWith = Rp, W.drop = is, W.dropRight = os, W.dropRightWhile = ss, W.dropWhile = as, W.fill = us, W.filter = oa, W.flatMap = sa, W.flatMapDeep = aa, W.flatMapDepth = ua, W.flatten = ps, W.flattenDeep = fs, W.flattenDepth = hs, W.flip = Sa, W.flow = Xf, W.flowRight = Kf, W.fromPairs = ds, W.functions = Nu, W.functionsIn = $u, W.groupBy = Xp, W.initial = ys, W.intersection = Np, W.intersectionBy = $p, W.intersectionWith = Dp, W.invert = Rf, W.invertBy = Nf, W.invokeMap = Kp, W.iteratee = jl, W.keyBy = Qp, W.keys = Pu, W.keysIn = Bu, W.map = fa, W.mapKeys = qu, W.mapValues = Fu, W.matches = Ol, W.matchesProperty = Il, W.memoize = ja, W.merge = Df, W.mergeWith = Mf, W.method = Qf, W.methodOf = eh, W.mixin = Rl, W.negate = Oa, W.nthArg = Dl, W.omit = Lf, W.omitBy = Vu, W.once = Ia, W.orderBy = ha, W.over = th, W.overArgs = uf, W.overEvery = nh, W.overSome = rh, W.partial = lf, W.partialRight = cf, W.partition = ef, W.pick = Pf, W.pickBy = Uu, W.property = Ml, W.propertyOf = Ll, W.pull = Mp, W.pullAll = _s, W.pullAllBy = ks, W.pullAllWith = Ts, W.pullAt = Lp, W.range = ih, W.rangeRight = oh, W.rearg = pf, W.reject = va, W.remove = Es, W.rest = Ra, W.reverse = Cs, W.sampleSize = ma, W.set = Hu, W.setWith = Wu, W.shuffle = ba, W.slice = As, W.sortBy = tf, W.sortedUniq = $s, W.sortedUniqBy = Ds, W.split = hl, W.spread = Na, W.tail = Ms, W.take = Ls, W.takeRight = Ps, W.takeRightWhile = Bs, W.takeWhile = qs, W.tap = Zs, W.throttle = $a, W.thru = Ys, W.toArray = mu, W.toPairs = Bf, W.toPairsIn = qf, W.toPath = zl, W.toPlainObject = ku, W.transform = Gu, W.unary = Da, W.union = Pp, W.unionBy = Bp, W.unionWith = qp, W.uniq = Fs, W.uniqBy = Vs, W.uniqWith = Us, W.unset = Ju, W.unzip = zs, W.unzipWith = Hs, W.update = Zu, W.updateWith = Yu, W.values = Xu, W.valuesIn = Ku, W.without = Fp, W.words = kl, W.wrap = Ma, W.xor = Vp, W.xorBy = Up, W.xorWith = zp, W.zip = Hp, W.zipObject = Ws, W.zipObjectDeep = Gs, W.zipWith = Wp, W.entries = Bf, W.entriesIn = qf, W.extend = Cf, W.extendWith = Af, Rl(W, W), W.add = sh, W.attempt = Zf, W.camelCase = Ff, W.capitalize = nl, W.ceil = ah, W.clamp = Qu, W.clone = Pa, W.cloneDeep = qa, W.cloneDeepWith = Fa, W.cloneWith = Ba, W.conformsTo = Va, W.deburr = rl, W.defaultTo = Al, W.divide = uh, W.endsWith = il, W.eq = Ua, W.escape = ol, W.escapeRegExp = sl, W.every = ia, W.find = Zp, W.findIndex = ls, W.findKey = Au, W.findLast = Yp, W.findLastIndex = cs, W.findLastKey = Su, W.floor = lh, W.forEach = la, W.forEachRight = ca, W.forIn = ju, W.forInRight = Ou, W.forOwn = Iu, W.forOwnRight = Ru, W.get = Du, W.gt = ff, W.gte = hf, W.has = Mu, W.hasIn = Lu, W.head = gs, W.identity = Sl, W.includes = pa, W.indexOf = vs, W.inRange = el, W.invoke = $f, W.isArguments = df, W.isArray = gf, W.isArrayBuffer = vf, W.isArrayLike = za, W.isArrayLikeObject = Ha, W.isBoolean = Wa, W.isBuffer = yf, W.isDate = mf, W.isElement = Ga, W.isEmpty = Ja, W.isEqual = Za, W.isEqualWith = Ya, W.isError = Xa, W.isFinite = Ka, W.isFunction = Qa, W.isInteger = eu, W.isLength = tu, W.isMap = bf, W.isMatch = iu, W.isMatchWith = ou, W.isNaN = su, W.isNative = au, W.isNil = lu, W.isNull = uu, W.isNumber = cu, W.isObject = nu, W.isObjectLike = ru, W.isPlainObject = pu, W.isRegExp = xf, W.isSafeInteger = fu, W.isSet = wf, W.isString = hu, W.isSymbol = du, W.isTypedArray = _f, W.isUndefined = gu, W.isWeakMap = vu, W.isWeakSet = yu, W.join = ms, W.kebabCase = Vf, W.last = bs, W.lastIndexOf = xs, W.lowerCase = Uf, W.lowerFirst = zf, W.lt = kf, W.lte = Tf, W.max = Wl, W.maxBy = Gl, W.mean = Jl, W.meanBy = Zl, W.min = Yl, W.minBy = Xl, W.stubArray = Pl, W.stubFalse = Bl, W.stubObject = ql, W.stubString = Fl, W.stubTrue = Vl, W.multiply = ch, W.nth = ws, W.noConflict = Nl, W.noop = $l, W.now = nf, W.pad = al, W.padEnd = ul, W.padStart = ll, W.parseInt = cl, W.random = tl, W.reduce = da, W.reduceRight = ga, W.repeat = pl, W.replace = fl, W.result = zu, W.round = ph, W.runInContext = g, W.sample = ya, W.size = xa, W.snakeCase = Hf, W.some = wa, W.sortedIndex = Ss, W.sortedIndexBy = js, W.sortedIndexOf = Os, W.sortedLastIndex = Is, W.sortedLastIndexBy = Rs, W.sortedLastIndexOf = Ns, W.startCase = Wf, W.startsWith = dl, W.subtract = fh, W.sum = Kl, W.sumBy = Ql, W.template = gl, W.times = Ul, W.toFinite = bu, W.toInteger = xu, W.toLength = wu, W.toLower = vl, W.toNumber = _u, W.toSafeInteger = Tu, W.toString = Eu, W.toUpper = yl, W.trim = ml, W.trimEnd = bl, W.trimStart = xl, W.truncate = wl, W.unescape = _l, W.uniqueId = Hl, W.upperCase = Gf, W.upperFirst = Jf, W.each = la, W.eachRight = ca, W.first = gs, Rl(W, function() {
					var e = {};
					return lr(W, function(t, n) {
						dc.call(W.prototype, n) || (e[n] = t)
					}), e
				}(), {
					chain: !1
				}), W.VERSION = ee, i(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(e) {
					W[e].placeholder = W
				}), i(["drop", "take"], function(e, t) {
					Dt.prototype[e] = function(n) {
						var r = this.__filtered__;
						if (r && !t) return new Dt(this);
						n = n === Q ? 1 : Uc(xu(n), 0);
						var i = this.clone();
						return r ? i.__takeCount__ = zc(n, i.__takeCount__) : i.__views__.push({
							size: zc(n, Oe),
							type: e + (i.__dir__ < 0 ? "Right" : "")
						}), i
					}, Dt.prototype[e + "Right"] = function(t) {
						return this.reverse()[e](t).reverse()
					}
				}), i(["filter", "map", "takeWhile"], function(e, t) {
					var n = t + 1,
						r = n == ke || n == Ee;
					Dt.prototype[e] = function(e) {
						var t = this.clone();
						return t.__iteratees__.push({
							iteratee: mo(e, 3),
							type: n
						}), t.__filtered__ = t.__filtered__ || r, t
					}
				}), i(["head", "last"], function(e, t) {
					var n = "take" + (t ? "Right" : "");
					Dt.prototype[e] = function() {
						return this[n](1).value()[0]
					}
				}), i(["initial", "tail"], function(e, t) {
					var n = "drop" + (t ? "" : "Right");
					Dt.prototype[e] = function() {
						return this.__filtered__ ? new Dt(this) : this[n](1)
					}
				}), Dt.prototype.compact = function() {
					return this.filter(Sl)
				}, Dt.prototype.find = function(e) {
					return this.filter(e).head()
				}, Dt.prototype.findLast = function(e) {
					return this.reverse().find(e)
				}, Dt.prototype.invokeMap = ni(function(e, t) {
					return "function" == typeof e ? new Dt(this) : this.map(function(n) {
						return Er(n, e, t)
					})
				}), Dt.prototype.reject = function(e) {
					return this.filter(Oa(mo(e)))
				}, Dt.prototype.slice = function(e, t) {
					e = xu(e);
					var n = this;
					return n.__filtered__ && (e > 0 || t < 0) ? new Dt(n) : (e < 0 ? n = n.takeRight(-e) : e && (n = n.drop(e)), t !== Q && (t = xu(t), n = t < 0 ? n.dropRight(-t) : n.take(t - e)), n)
				}, Dt.prototype.takeRightWhile = function(e) {
					return this.reverse().takeWhile(e).reverse()
				}, Dt.prototype.toArray = function() {
					return this.take(Oe)
				}, lr(Dt.prototype, function(e, t) {
					var n = /^(?:filter|find|map|reject)|While$/.test(t),
						r = /^(?:head|last)$/.test(t),
						i = W[r ? "take" + ("last" == t ? "Right" : "") : t],
						o = r || /^find/.test(t);
					i && (W.prototype[t] = function() {
						var t = this.__wrapped__,
							s = r ? [1] : arguments,
							a = t instanceof Dt,
							u = s[0],
							l = a || gf(t),
							c = function(e) {
								var t = i.apply(W, p([e], s));
								return r && f ? t[0] : t
							};
						l && n && "function" == typeof u && 1 != u.length && (a = l = !1);
						var f = this.__chain__,
							h = !!this.__actions__.length,
							d = o && !f,
							g = a && !h;
						if (!o && l) {
							t = g ? t : new Dt(this);
							var v = e.apply(t, s);
							return v.__actions__.push({
								func: Ys,
								args: [c],
								thisArg: Q
							}), new X(v, f)
						}
						return d && g ? e.apply(this, s) : (v = this.thru(c), d ? r ? v.value()[0] : v.value() : v)
					})
				}), i(["pop", "push", "shift", "sort", "splice", "unshift"], function(e) {
					var t = lc[e],
						n = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru",
						r = /^(?:pop|shift)$/.test(e);
					W.prototype[e] = function() {
						var e = arguments;
						if (r && !this.__chain__) {
							var i = this.value();
							return t.apply(gf(i) ? i : [], e)
						}
						return this[n](function(n) {
							return t.apply(gf(n) ? n : [], e)
						})
					}
				}), lr(Dt.prototype, function(e, t) {
					var n = W[t];
					if (n) {
						var r = n.name + "",
							i = np[r] || (np[r] = []);
						i.push({
							name: t,
							func: n
						})
					}
				}), np[Xi(Q, ue).name] = [{
					name: "wrapper",
					func: Q
				}], Dt.prototype.clone = Gt, Dt.prototype.reverse = Jt, Dt.prototype.value = Zt, W.prototype.at = Gp, W.prototype.chain = Xs, W.prototype.commit = Ks, W.prototype.next = Qs, W.prototype.plant = ta, W.prototype.reverse = na, W.prototype.toJSON = W.prototype.valueOf = W.prototype.value = ra, W.prototype.first = W.prototype.head, Oc && (W.prototype[Oc] = ea), W
			},
			dr = hr();
		"function" == typeof define && "object" == typeof define.amd && define.amd ? (Xn._ = dr, define("lodash", [], function() {
			return dr
		})) : Qn ? ((Qn.exports = dr)._ = dr, Kn._ = dr) : Xn._ = dr
	}.call(this), function(e, t) {
		if ("function" == typeof define && define.amd) define("helpers/examples", ["exports"], t);
		else if ("undefined" != typeof exports) t(exports);
		else {
			var n = {
				exports: {}
			};
			t(n.exports), e.examples = n.exports
		}
	}(this, function(e) {
		"use strict";
		Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = examples
	}), define("templates/sendBoxLayout.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "sendBoxLayout.twig",
				allowInlineIncludes: !0,
				data: [
				{
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "examplesPresent",
							match: ["examplesPresent"]
						}, {
							type: "Twig.expression.type.bool",
							value: true
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [
							{
								type: "raw",
								value: '<div class="sendBox">\n\n</div>\n\n<br><h1>Examples:</h1>\n<div class="examples">\n\n</div>'
							}
						]
					}
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.else",
						match: ["else"],
						output: [{
							type: "raw",
							value: '<div class="sendBox">\n\n</div>\n\n<br>\n<div class="examples">\n\n</div>'
						}]
					}
				}
				],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), define("templates/sendBox.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "sendBox.twig",
				allowInlineIncludes: !0,
				data: [
				{
					type: "raw",
					value: '<div class="header">\n    <div class="panel panel-default  text-center">\n        <h2>API call: '
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "path",
						match: ["path"]
					}]
				},				{
					type: "raw",
					value: '</h2>\n    </div>\n</div>\n<Br>\n\nDescription:<span class="form-control dt-desc">'
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "description",
						match: ["description"]
					}]
				}, {
					type: "raw",
					value: '</span>'
				}, {type: "raw",
					value: '<Br>\n\nParameters:<div class="dt-params">\n <table class="table">\n'
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.for",
						key_var: null,
						value_var: "param",
						expression: [
						{
							type: "Twig.expression.type.variable",
							value: "params",
							match: ["params"]
						}],
						output: [
						{
							type: "raw",
							value: "<tr><td width='200' style='font-size: 14px'>"
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "param",
								match: ["param"]
							},{
								type: "Twig.expression.type.key.period",
								key: "name"
							}]
						}, {
							type: "raw",
							value: "</td>\n"
						},
						{
							type: "raw",
							value: "<td style='font-size: 14px'>"
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "param",
								match: ["param"]
							},{
								type: "Twig.expression.type.key.period",
								key: "description"
							}]
						}, {
							type: "raw",
							value: "</td><tr>\n"
						}
						]
					}
				}, {
					type: "raw",
					value: '</table>\n</div>Returns:<div class="dt-params">\n <table class="table">\n'
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.for",
						key_var: null,
						value_var: "areturn",
						expression: [
						{
							type: "Twig.expression.type.variable",
							value: "returns",
							match: ["returns"]
						}],
						output: [
						{
							type: "raw",
							value: "<tr><td width='200' style='font-size: 14px'>"
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "areturn",
								match: ["areturn"]
							},{
								type: "Twig.expression.type.key.period",
								key: "name"
							}]
						}, {
							type: "raw",
							value: "</td>\n"
						},
						{
							type: "raw",
							value: "<td style='font-size: 14px'>"
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "areturn",
								match: ["areturn"]
							},{
								type: "Twig.expression.type.key.period",
								key: "description"
							}]
						}, {
							type: "raw",
							value: "</td><tr>\n"
						}
						]
					}
				}, {
					type: "raw",
					value: '</table>\n</div>'
				},
				{
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "method",
							match: ["method"]
						}, {
							type: "Twig.expression.type.string",
							value: "POST"
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [
							{
								type: "raw",
								value: 'Method: POST<br><br>\n\n'
							},
							{
								type: "raw",
								value: 'Permission roles allowed to make this API call: <strong>'
							},
							{
								type: "output",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "permissions",
									match: ["permissions"]
								}]
							}, {
								type: "raw",
								value: '</strong>\n<Br>\n\n'
							},
							{
								type: "raw",
								value: '\n<Br>Url:<input readonly title="url" class="form-control dt-url" value="'
							},
							{
								type: "output",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "fullpath",
									match: ["fullpath"]
								}]
							}, {
								type: "raw",
								value: '"/>\n<Br>\n\n'
							},
							{
								type: "logic",
								token: {
									type: "Twig.logic.type.if",
									stack: [{
										type: "Twig.expression.type.variable",
										value: "activeitem",
										match: ["activeitem"]
									}, {
										type: "Twig.expression.type.bool",
										value: true
									}, {
										type: "Twig.expression.type.operator.binary",
										value: "==",
										precidence: 9,
										associativity: "leftToRight",
										operator: "=="
									}],
									output: [
									{
										type: "raw",
										value: '<table class="table">\n    <tbody>\n    <tr>\n        <td>Request</td>\n        <td>Response&nbsp;<span class="dt-status"></span></td>\n    </tr>\n    <tr>\n        <td style="width: 50%"><textarea style="resize: none; height: 300px" title="input" class="dt-input form-control"> </textarea></td>\n        <td style="width: 50%"><textarea style="resize: none; height: 300px" title="output" class="dt-output form-control"> </textarea></td>\n    </tr>\n    </tbody>\n</table>\n<button class="btn dt-send">send</button>'
									}
								]
							}
						},
						]
					}
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "method",
							match: ["method"]
						}, {
							type: "Twig.expression.type.string",
							value: "GET"
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [{
							type: "raw",
							value: 'Method: GET<br><br>'
						},
						{
							type: "raw",
							value: 'Permission roles allowed to make this API call: <strong>'
						},
						{
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "permissions",
								match: ["permissions"]
							}]
						}, {
							type: "raw",
							value: '</strong>\n<Br>\n\n'
						},
						{
							type: "raw",
							value: '<Br>\nUrl:<input readonly title="url" class="form-control dt-url" value="'
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "fullpath",
								match: ["fullpath"]
							}]
						}, {
							type: "raw",
							value: '"/><Br><table class="table" style="margin-bottom:5px;"><tbody>'
						}]
					}
				},
				{
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "method",
							match: ["method"]
						}, {
							type: "Twig.expression.type.string",
							value: "GET"
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [
						{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "returntype",
									match: ["returntype"]
								}, {
									type: "Twig.expression.type.string",
									value: "html"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '<tr><td>Request URL</td><td></td></tr>'
								}]
							},
						},{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "returntype",
									match: ["returntype"]
								}, {
									type: "Twig.expression.type.string",
									value: "json"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '<tr><td>Request URL</td><td>Response&nbsp;<span class="dt-status"></span></td></tr>'
								}]
							}
						},						{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "params",
									match: ["params"]
								}, {
									type: "Twig.expression.type.string",
									value: []
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '<tr><td style="width: 50%"><input readonly title="input" class="dt-input form-control" value="'
								}]
							}
						}, {
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "params",
									match: ["params"]
								}, {
									type: "Twig.expression.type.string",
									value: []
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "!=",
									precidence: 9,
									associativity: "leftToRight",
									operator: "!="
								}],
								output: [{
									type: "raw",
									value: '<tr><td style="width: 50%"><input title="input" class="dt-input form-control" value="'
								}]
							}
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "getpath",
								match: ["getpath"]
							}]
						}, {
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "returntype",
									match: ["returntype"]
								}, {
									type: "Twig.expression.type.string",
									value: "html"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '"> </input><button class="btn dt-view">view</button></td>'
								}]
							},
						},{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "returntype",
									match: ["returntype"]
								}, {
									type: "Twig.expression.type.string",
									value: "json"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '"> </input><button class="btn dt-send">send</button></td><td style="width: 50%"><textarea style="resize: none; height: 300px; margin-bottom:5px;" title="output" class="dt-output form-control"> </textarea></td>'
								}]
							}
						}, {
							type: "raw",
							value: '</tr></tbody></table>'
						}
						]
					}
				}],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), function(e, t) {
		if ("function" == typeof define && define.amd) define("helpers/config", ["exports", "lodash"], t);
		else if ("undefined" != typeof exports) t(exports, require("lodash"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.lodash), e.config = n.exports
		}
	}(this, function(e, t) {
		"use strict";

		function n(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var r = n(t);
		e.default = r.default.extend({}, config)
	}), function(e, t) {
		if ("function" == typeof define && define.amd) define("helpers/Messenger", ["exports", "jquery"], t);
		else if ("undefined" != typeof exports) t(exports, require("jquery"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.jquery), e.Messenger = n.exports
		}
	}(this, function(e, t) {
		"use strict";

		function n(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}

		function r(e, t) {
			if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var i = n(t),
			o = function() {
				function e(e, t) {
					for (var n = 0; n < t.length; n++) {
						var r = t[n];
						r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
					}
				}
				return function(t, n, r) {
					return n && e(t.prototype, n), r && e(t, r), t
				}
			}(),
			s = function() {
				function e() {
					r(this, e), this.fadeOutTime = 1500, this.fadeInTime = 1500
				}
				return o(e, [{
					key: "success",
					value: function t() {
						var n = this,
							r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "success",
							t = e.createMessage(r, "rgb(54, 157, 22)");
						document.body.appendChild(t), (0, i.default)(t).fadeIn(this.fadeInTime, function() {
							(0, i.default)(t).fadeOut(n.fadeOutTime, function() {
								return t.parentNode.removeChild(t)
							})
						})
					}
				}, {
					key: "fail",
					value: function t() {
						var n = this,
							r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "fail",
							t = e.createMessage(r, "rgb(255, 0, 0)");
						document.body.appendChild(t), (0, i.default)(t).fadeIn(this.fadeInTime, function() {
							(0, i.default)(t).fadeOut(n.fadeOutTime, function() {
								return t.parentNode.removeChild(t)
							})
						})
					}
				}], [{
					key: "messageStyle",
					value: function(e) {
						return "padding: 20px;\n            background-color: " + e + ";\n            color: white;\n            position: fixed;\n            top: 0;\n            right: 0;\n            z-index: 2147483647;\n            width: auto;\n            text-align: center;\n            border-radius: 7px;"
					}
				}, {
					key: "createMessage",
					value: function(t, n) {
						var r = document.createElement("div");
						return r.style = e.messageStyle(n), r.textContent = t, r
					}
				}]), e
			}();
		e.default = s
	}), function(e, t) {
		if ("function" == typeof define && define.amd) define("views/sendBox", ["exports", "backbone.marionette", "templates/sendBox.twig", "lodash", "jquery", "../helpers/config", "../helpers/Messenger"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("templates/sendBox.twig"), require("lodash"), require("jquery"), require("../helpers/config"), require("../helpers/Messenger"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.sendBox, e.lodash, e.jquery, e.config, e.Messenger), e.sendBox = n.exports
		}
	}(this, function(e, t, n, r, i, o, s) {
		"use strict";

		function a(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var u = a(t),
			l = a(r),
			c = a(i),
			p = a(o),
			f = a(s),
			h = 400,
			d = u.default.View.extend({
				template: n.render,
				initialize: function() {
					this.messenger = new f.default
				},
				ui: {
					description: ".dt-desc",
					params: ".dt-params",
					returns: ".dt-returns",
					url: ".dt-url",
					method: ".dt-method",
					input: ".dt-input",
					output: ".dt-output",
					outputStatus: ".dt-status"
				},
				tellStatus: function(e) {
					e.status && e.status >= h ? this.messenger.fail(e.status) : e.status && e.status < h && this.messenger.success(e.status), e.status || console.error("no status in response")
				},
				events: {
					"click .dt-view": "view",
					"click .dt-send": "send"
				},
				view: function() {
					var url = this.ui.input.val();
					//window.open(url, '_blank');
					//window.open(url);
					window.location.href = url;
				},
				send: function() {

					var n = this;
					var mymethod = this.$(".dt-method:checked").val();
					//alert(this.ui.url.val());
					//alert(e)

					if (mymethod == "POST") {
						var e = this.ui.input.val(),
							t = !0;
						try {
							e = JSON.stringify(JSON.parse(e))
						} catch (e) {
							t = !1
						}
						if (!t) return void this.messenger.fail("incorrect JSON");

						c.default.ajax({
							data: e,
							contentType: "application/json",
							url: this.ui.url.val(),
							method: "POST",
							success: function(e, t, r) {
								var i = void 0;
								try {
									i = JSON.stringify(e, null, 2)
								} catch (t) {
									i = e
								}
								n.ui.output.text(i), n.tellStatus(r), n.ui.outputStatus.text(r.status)
							},
							error: function(e) {
								var t = void 0;
								try {
									t = JSON.stringify(JSON.parse(e.responseText), null, 2)
								} catch (n) {
									t = e.responseText
								}
								n.tellStatus(e), n.ui.output.text(t), n.ui.outputStatus.text(e.status)
							}
						})
					} else if (mymethod == "GET") {
						var e = this.ui.input.val();
						var geturl = e.trim();

						c.default.ajax({
							url: geturl,
							method: "GET",
							success: function(e, t, r) {
								var i = void 0;
								try {
									i = JSON.stringify(e, null, 2)
								} catch (t) {
									i = e
								}
								n.ui.output.text(i), n.tellStatus(r), n.ui.outputStatus.text(r.status)
							},
							error: function(e) {
								var t = void 0;
								try {
									t = JSON.stringify(JSON.parse(e.responseText), null, 2)
								} catch (n) {
									t = e.responseText
								}
								n.tellStatus(e), n.ui.output.text(t), n.ui.outputStatus.text(e.status)
							}
						})
					}
				},
				serializeData: function() {
					var e = "" + (p.default.baseUrl || "");
					var t = ("" + this.model.get("prefix") + this.model.get("path")).replace(/\/\//, "/");
					var n = "" + e + t;
					var g = n;
					if (n.lastIndexOf("/:")!=-1){
						g = n.substring(0,n.lastIndexOf("/:")+1);
					}

					var active = true;
					if (this.model.get("activeitem") === false) {
						active = false;
					}

					return "/" === l.default.last(e) && "/" === l.default.first(t) ? n = "" + e + t.slice(1) : "/" !== l.default.last(e) && "/" !== l.default.first(t) && (n = e + "/" + t), {
						path: n,
						fullpath: mainBaseURL+n,
						getpath: g,
						examplesPresent: this.model.get("examplesPresent"),
						permissions: l.default.map(this.model.get("permissions")),
						activeitem: active,
						description: this.model.get("description"),
						params: this.model.get("params"),
						returns: this.model.get("returns"),
						returntype: this.model.get("returntype"),
						model: this.model,
						method: l.default.map(this.model.get("methods"), function(e, t) {
							return l.default.upperCase(t)
						})[0]
					}
				}
			});
		e.default = d
	}), define("templates/example.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "example.twig",
				allowInlineIncludes: !0,
				data: [{
					type: "raw",
					value: '<div class="dt-example-item">\n    <table class="table table-hover">\n        <tr>\n            <td '
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "status",
							match: ["status"]
						}, {
							type: "Twig.expression.type.number",
							value: 400,
							match: ["400", null]
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "<",
							precidence: 8,
							associativity: "leftToRight",
							operator: "<"
						}],
						output: [{
							type: "raw",
							value: 'class="info" '
						}]
					}
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.else",
						match: ["else"],
						output: [{
							type: "raw",
							value: 'class="danger"'
						}]
					}
				}, {
					type: "raw",
					value: ">"
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "status",
						match: ["status"]
					}]
				}, {
					type: "raw",
					value: '</td>\n            <td class="success">'
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "url",
						match: ["url"]
					}]
				}, {
					type: "raw",
					value: '</td></tr></table></div>'
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "method",
							match: ["method"]
						}, {
							type: "Twig.expression.type.string",
							value: "POST"
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [
						{
							type: "raw",
							value: '<table class="table dt-example-content"><tbody><tr><td>Request JSON</td><td>Response</td></tr><tr><td>'
						}, {
							type: "raw",
							value: '<textarea readonly style="width:100%;resize:none;height: 300px" class="form-control">'
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "request",
								match: ["request"]
							}]
						}, {
							type: "raw",
							value: '</textarea></td><td><textarea readonly style="width:100%;resize:none;height: 300px" class="form-control">'
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "response",
								match: ["response"]
							}]
						}, {
							type: "raw",
							value: "</textarea></td></tr></tbody></table>"
						}]
					}
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.if",
						stack: [{
							type: "Twig.expression.type.variable",
							value: "method",
							match: ["method"]
						}, {
							type: "Twig.expression.type.string",
							value: "GET"
						}, {
							type: "Twig.expression.type.operator.binary",
							value: "==",
							precidence: 9,
							associativity: "leftToRight",
							operator: "=="
						}],
						output: [
						{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "type",
									match: ["type"]
								}, {
									type: "Twig.expression.type.string",
									value: "html"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '<table class="table dt-example-content"><tbody><tr><td>Request URL</td><td></td></tr><tr><td>'
								}, {
									type: "raw",
									value: '<input readonly style="width:50%;" class="form-control" value="'
								}, {
									type: "output",
									stack: [{
										type: "Twig.expression.type.variable",
										value: "request",
										match: ["request"]
									}]
								},{
									type: "raw",
									value: '"></input></td><td>'
								}, {
									type: "raw",
									value: "</td></tr></tbody></table>"
								}]
							},
						},{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "type",
									match: ["type"]
								}, {
									type: "Twig.expression.type.string",
									value: "application/json"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '<table class="table dt-example-content"><tbody><tr><td>Request URL</td><td>Response</td></tr><tr><td>'
								}, {
									type: "raw",
									value: '<input readonly style="width:100%;" class="form-control" value="'
								}, {
									type: "output",
									stack: [{
										type: "Twig.expression.type.variable",
										value: "request",
										match: ["request"]
									}]
								},{
									type: "raw",
									value: '"></input></td><td><textarea readonly style="width:100%;resize:none;height: 300px" class="form-control">'
								}, {
									type: "output",
									stack: [{
										type: "Twig.expression.type.variable",
										value: "response",
										match: ["response"]
									}]
								}, {
									type: "raw",
									value: "</textarea></td></tr></tbody></table>"
								}]
							}
						}]
					}
				}],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), function(e, t) {
		if ("function" == typeof define && define.amd) define("views/example", ["exports", "backbone.marionette", "templates/example.twig"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("templates/example.twig"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.example), e.example = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var i = r(t),
			o = i.default.View.extend({
				template: n.render,
				ui: {
					item: ".dt-example-item",
					example: ".dt-example-content"
				},
				events: {
					"click @ui.item": "showExample"
				},
				showExample: function() {
					this.ui.example.slideToggle()
				},
				serializeData: function() {

					//console.log(decodeURIComponent(this.model.get("request")));
					//MB: changed from decodeURI to decodeURIComponent otherwise it didn't do colons - new change as code works on blockcn07?

					var method = this.model.get("method");
					var e = "";
					if (method == "GET") {
						e = decodeURIComponent(this.model.get("request"));
					} else {
						e = JSON.stringify(JSON.parse(decodeURIComponent(this.model.get("request"))), null, 2)
					}

					var	t = this.model;
					var n = "";
					var	r = void 0;
					if (this.model.get("response") != "") {
						n = JSON.stringify(JSON.parse(decodeURIComponent(this.model.get("response"))), null, 2);
					}

					try {
						r = JSON.stringify(JSON.parse(n), null, 2)
					} catch (e) {
						! function() {
							var e = {
								"&": "&amp;",
								"<": "&lt;",
								">": "&gt;"
							};
							r = n.replace(/[&<>]/g, function(t) {
								return e[t] || t
							})
						}()
					}
					var i = t.get("method"),
						o = t.get("status"),
						s = t.get("url"),
						a = t.get("type");
					return {
						model: t,
						url: s,
						status: o,
						type: a,
						method: i,
						response: r,
						request: e
					}
				}
			});
		e.default = o
	}), "undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery"); + function(e) {
	"use strict";
	var t = e.fn.jquery.split(" ")[0].split(".");
	if (t[0] < 2 && t[1] < 9 || 1 == t[0] && 9 == t[1] && t[2] < 1 || t[0] > 3) throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")
}(jQuery), + function(e) {
	"use strict";

	function t() {
		var e = document.createElement("bootstrap"),
			t = {
				WebkitTransition: "webkitTransitionEnd",
				MozTransition: "transitionend",
				OTransition: "oTransitionEnd otransitionend",
				transition: "transitionend"
			};
		for (var n in t)
			if (void 0 !== e.style[n]) return {
				end: t[n]
			};
		return !1
	}
	e.fn.emulateTransitionEnd = function(t) {
		var n = !1,
			r = this;
		e(this).one("bsTransitionEnd", function() {
			n = !0
		});
		var i = function() {
			n || e(r).trigger(e.support.transition.end)
		};
		return setTimeout(i, t), this
	}, e(function() {
		e.support.transition = t(), e.support.transition && (e.event.special.bsTransitionEnd = {
			bindType: e.support.transition.end,
			delegateType: e.support.transition.end,
			handle: function(t) {
				if (e(t.target).is(this)) return t.handleObj.handler.apply(this, arguments)
			}
		})
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var n = e(this),
				i = n.data("bs.alert");
			i || n.data("bs.alert", i = new r(this)), "string" == typeof t && i[t].call(n)
		})
	}
	var n = '[data-dismiss="alert"]',
		r = function(t) {
			e(t).on("click", n, this.close)
		};
	r.VERSION = "3.3.7", r.TRANSITION_DURATION = 150, r.prototype.close = function(t) {
		function n() {
			s.detach().trigger("closed.bs.alert").remove()
		}
		var i = e(this),
			o = i.attr("data-target");
		o || (o = i.attr("href"), o = o && o.replace(/.*(?=#[^\s]*$)/, ""));
		var s = e("#" === o ? [] : o);
		t && t.preventDefault(), s.length || (s = i.closest(".alert")), s.trigger(t = e.Event("close.bs.alert")), t.isDefaultPrevented() || (s.removeClass("in"), e.support.transition && s.hasClass("fade") ? s.one("bsTransitionEnd", n).emulateTransitionEnd(r.TRANSITION_DURATION) : n())
	};
	var i = e.fn.alert;
	e.fn.alert = t, e.fn.alert.Constructor = r, e.fn.alert.noConflict = function() {
		return e.fn.alert = i, this
	}, e(document).on("click.bs.alert.data-api", n, r.prototype.close)
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.button"),
				o = "object" == typeof t && t;
			i || r.data("bs.button", i = new n(this, o)), "toggle" == t ? i.toggle() : t && i.setState(t)
		})
	}
	var n = function(t, r) {
		this.$element = e(t), this.options = e.extend({}, n.DEFAULTS, r), this.isLoading = !1
	};
	n.VERSION = "3.3.7", n.DEFAULTS = {
		loadingText: "loading..."
	}, n.prototype.setState = function(t) {
		var n = "disabled",
			r = this.$element,
			i = r.is("input") ? "val" : "html",
			o = r.data();
		t += "Text", null == o.resetText && r.data("resetText", r[i]()), setTimeout(e.proxy(function() {
			r[i](null == o[t] ? this.options[t] : o[t]), "loadingText" == t ? (this.isLoading = !0, r.addClass(n).attr(n, n).prop(n, !0)) : this.isLoading && (this.isLoading = !1, r.removeClass(n).removeAttr(n).prop(n, !1))
		}, this), 0)
	}, n.prototype.toggle = function() {
		var e = !0,
			t = this.$element.closest('[data-toggle="buttons"]');
		if (t.length) {
			var n = this.$element.find("input");
			"radio" == n.prop("type") ? (n.prop("checked") && (e = !1), t.find(".active").removeClass("active"), this.$element.addClass("active")) : "checkbox" == n.prop("type") && (n.prop("checked") !== this.$element.hasClass("active") && (e = !1), this.$element.toggleClass("active")), n.prop("checked", this.$element.hasClass("active")), e && n.trigger("change")
		} else this.$element.attr("aria-pressed", !this.$element.hasClass("active")), this.$element.toggleClass("active")
	};
	var r = e.fn.button;
	e.fn.button = t, e.fn.button.Constructor = n, e.fn.button.noConflict = function() {
		return e.fn.button = r, this
	}, e(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function(n) {
		var r = e(n.target).closest(".btn");
		t.call(r, "toggle"), e(n.target).is('input[type="radio"], input[type="checkbox"]') || (n.preventDefault(), r.is("input,button") ? r.trigger("focus") : r.find("input:visible,button:visible").first().trigger("focus"))
	}).on("focus.bs.button.data-api blur.bs.button.data-api", '[data-toggle^="button"]', function(t) {
		e(t.target).closest(".btn").toggleClass("focus", /^focus(in)?$/.test(t.type))
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.carousel"),
				o = e.extend({}, n.DEFAULTS, r.data(), "object" == typeof t && t),
				s = "string" == typeof t ? t : o.slide;
			i || r.data("bs.carousel", i = new n(this, o)), "number" == typeof t ? i.to(t) : s ? i[s]() : o.interval && i.pause().cycle()
		})
	}
	var n = function(t, n) {
		this.$element = e(t), this.$indicators = this.$element.find(".carousel-indicators"), this.options = n, this.paused = null, this.sliding = null, this.interval = null, this.$active = null, this.$items = null, this.options.keyboard && this.$element.on("keydown.bs.carousel", e.proxy(this.keydown, this)), "hover" == this.options.pause && !("ontouchstart" in document.documentElement) && this.$element.on("mouseenter.bs.carousel", e.proxy(this.pause, this)).on("mouseleave.bs.carousel", e.proxy(this.cycle, this))
	};
	n.VERSION = "3.3.7", n.TRANSITION_DURATION = 600, n.DEFAULTS = {
		interval: 5e3,
		pause: "hover",
		wrap: !0,
		keyboard: !0
	}, n.prototype.keydown = function(e) {
		if (!/input|textarea/i.test(e.target.tagName)) {
			switch (e.which) {
				case 37:
					this.prev();
					break;
				case 39:
					this.next();
					break;
				default:
					return
			}
			e.preventDefault()
		}
	}, n.prototype.cycle = function(t) {
		return t || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(e.proxy(this.next, this), this.options.interval)), this
	}, n.prototype.getItemIndex = function(e) {
		return this.$items = e.parent().children(".item"), this.$items.index(e || this.$active)
	}, n.prototype.getItemForDirection = function(e, t) {
		var n = this.getItemIndex(t),
			r = "prev" == e && 0 === n || "next" == e && n == this.$items.length - 1;
		if (r && !this.options.wrap) return t;
		var i = "prev" == e ? -1 : 1,
			o = (n + i) % this.$items.length;
		return this.$items.eq(o)
	}, n.prototype.to = function(e) {
		var t = this,
			n = this.getItemIndex(this.$active = this.$element.find(".item.active"));
		if (!(e > this.$items.length - 1 || e < 0)) return this.sliding ? this.$element.one("slid.bs.carousel", function() {
			t.to(e)
		}) : n == e ? this.pause().cycle() : this.slide(e > n ? "next" : "prev", this.$items.eq(e))
	}, n.prototype.pause = function(t) {
		return t || (this.paused = !0), this.$element.find(".next, .prev").length && e.support.transition && (this.$element.trigger(e.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
	}, n.prototype.next = function() {
		if (!this.sliding) return this.slide("next")
	}, n.prototype.prev = function() {
		if (!this.sliding) return this.slide("prev")
	}, n.prototype.slide = function(t, r) {
		var i = this.$element.find(".item.active"),
			o = r || this.getItemForDirection(t, i),
			s = this.interval,
			a = "next" == t ? "left" : "right",
			u = this;
		if (o.hasClass("active")) return this.sliding = !1;
		var l = o[0],
			c = e.Event("slide.bs.carousel", {
				relatedTarget: l,
				direction: a
			});
		if (this.$element.trigger(c), !c.isDefaultPrevented()) {
			if (this.sliding = !0, s && this.pause(), this.$indicators.length) {
				this.$indicators.find(".active").removeClass("active");
				var p = e(this.$indicators.children()[this.getItemIndex(o)]);
				p && p.addClass("active")
			}
			var f = e.Event("slid.bs.carousel", {
				relatedTarget: l,
				direction: a
			});
			return e.support.transition && this.$element.hasClass("slide") ? (o.addClass(t), o[0].offsetWidth, i.addClass(a), o.addClass(a), i.one("bsTransitionEnd", function() {
				o.removeClass([t, a].join(" ")).addClass("active"), i.removeClass(["active", a].join(" ")), u.sliding = !1, setTimeout(function() {
					u.$element.trigger(f)
				}, 0)
			}).emulateTransitionEnd(n.TRANSITION_DURATION)) : (i.removeClass("active"), o.addClass("active"), this.sliding = !1, this.$element.trigger(f)), s && this.cycle(), this
		}
	};
	var r = e.fn.carousel;
	e.fn.carousel = t, e.fn.carousel.Constructor = n, e.fn.carousel.noConflict = function() {
		return e.fn.carousel = r, this
	};
	var i = function(n) {
		var r, i = e(this),
			o = e(i.attr("data-target") || (r = i.attr("href")) && r.replace(/.*(?=#[^\s]+$)/, ""));
		if (o.hasClass("carousel")) {
			var s = e.extend({}, o.data(), i.data()),
				a = i.attr("data-slide-to");
			a && (s.interval = !1), t.call(o, s), a && o.data("bs.carousel").to(a), n.preventDefault()
		}
	};
	e(document).on("click.bs.carousel.data-api", "[data-slide]", i).on("click.bs.carousel.data-api", "[data-slide-to]", i), e(window).on("load", function() {
		e('[data-ride="carousel"]').each(function() {
			var n = e(this);
			t.call(n, n.data())
		})
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		var n, r = t.attr("data-target") || (n = t.attr("href")) && n.replace(/.*(?=#[^\s]+$)/, "");
		return e(r)
	}

	function n(t) {
		return this.each(function() {
			var n = e(this),
				i = n.data("bs.collapse"),
				o = e.extend({}, r.DEFAULTS, n.data(), "object" == typeof t && t);
			!i && o.toggle && /show|hide/.test(t) && (o.toggle = !1), i || n.data("bs.collapse", i = new r(this, o)), "string" == typeof t && i[t]()
		})
	}
	var r = function(t, n) {
		this.$element = e(t), this.options = e.extend({}, r.DEFAULTS, n), this.$trigger = e('[data-toggle="collapse"][href="#' + t.id + '"],[data-toggle="collapse"][data-target="#' + t.id + '"]'), this.transitioning = null, this.options.parent ? this.$parent = this.getParent() : this.addAriaAndCollapsedClass(this.$element, this.$trigger), this.options.toggle && this.toggle()
	};
	r.VERSION = "3.3.7", r.TRANSITION_DURATION = 350, r.DEFAULTS = {
		toggle: !0
	}, r.prototype.dimension = function() {
		var e = this.$element.hasClass("width");
		return e ? "width" : "height"
	}, r.prototype.show = function() {
		if (!this.transitioning && !this.$element.hasClass("in")) {
			var t, i = this.$parent && this.$parent.children(".panel").children(".in, .collapsing");
			if (!(i && i.length && (t = i.data("bs.collapse"), t && t.transitioning))) {
				var o = e.Event("show.bs.collapse");
				if (this.$element.trigger(o), !o.isDefaultPrevented()) {
					i && i.length && (n.call(i, "hide"), t || i.data("bs.collapse", null));
					var s = this.dimension();
					this.$element.removeClass("collapse").addClass("collapsing")[s](0).attr("aria-expanded", !0), this.$trigger.removeClass("collapsed").attr("aria-expanded", !0), this.transitioning = 1;
					var a = function() {
						this.$element.removeClass("collapsing").addClass("collapse in")[s](""), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
					};
					if (!e.support.transition) return a.call(this);
					var u = e.camelCase(["scroll", s].join("-"));
					this.$element.one("bsTransitionEnd", e.proxy(a, this)).emulateTransitionEnd(r.TRANSITION_DURATION)[s](this.$element[0][u])
				}
			}
		}
	}, r.prototype.hide = function() {
		if (!this.transitioning && this.$element.hasClass("in")) {
			var t = e.Event("hide.bs.collapse");
			if (this.$element.trigger(t), !t.isDefaultPrevented()) {
				var n = this.dimension();
				this.$element[n](this.$element[n]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded", !1), this.$trigger.addClass("collapsed").attr("aria-expanded", !1), this.transitioning = 1;
				var i = function() {
					this.transitioning = 0, this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")
				};
				return e.support.transition ? void this.$element[n](0).one("bsTransitionEnd", e.proxy(i, this)).emulateTransitionEnd(r.TRANSITION_DURATION) : i.call(this)
			}
		}
	}, r.prototype.toggle = function() {
		this[this.$element.hasClass("in") ? "hide" : "show"]()
	}, r.prototype.getParent = function() {
		return e(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each(e.proxy(function(n, r) {
			var i = e(r);
			this.addAriaAndCollapsedClass(t(i), i)
		}, this)).end()
	}, r.prototype.addAriaAndCollapsedClass = function(e, t) {
		var n = e.hasClass("in");
		e.attr("aria-expanded", n), t.toggleClass("collapsed", !n).attr("aria-expanded", n)
	};
	var i = e.fn.collapse;
	e.fn.collapse = n, e.fn.collapse.Constructor = r, e.fn.collapse.noConflict = function() {
		return e.fn.collapse = i, this
	}, e(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function(r) {
		var i = e(this);
		i.attr("data-target") || r.preventDefault();
		var o = t(i),
			s = o.data("bs.collapse"),
			a = s ? "toggle" : i.data();
		n.call(o, a)
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		var n = t.attr("data-target");
		n || (n = t.attr("href"), n = n && /#[A-Za-z]/.test(n) && n.replace(/.*(?=#[^\s]*$)/, ""));
		var r = n && e(n);
		return r && r.length ? r : t.parent()
	}

	function n(n) {
		n && 3 === n.which || (e(i).remove(), e(o).each(function() {
			var r = e(this),
				i = t(r),
				o = {
					relatedTarget: this
				};
			i.hasClass("open") && (n && "click" == n.type && /input|textarea/i.test(n.target.tagName) && e.contains(i[0], n.target) || (i.trigger(n = e.Event("hide.bs.dropdown", o)), n.isDefaultPrevented() || (r.attr("aria-expanded", "false"), i.removeClass("open").trigger(e.Event("hidden.bs.dropdown", o)))))
		}))
	}

	function r(t) {
		return this.each(function() {
			var n = e(this),
				r = n.data("bs.dropdown");
			r || n.data("bs.dropdown", r = new s(this)), "string" == typeof t && r[t].call(n)
		})
	}
	var i = ".dropdown-backdrop",
		o = '[data-toggle="dropdown"]',
		s = function(t) {
			e(t).on("click.bs.dropdown", this.toggle)
		};
	s.VERSION = "3.3.7", s.prototype.toggle = function(r) {
		var i = e(this);
		if (!i.is(".disabled, :disabled")) {
			var o = t(i),
				s = o.hasClass("open");
			if (n(), !s) {
				"ontouchstart" in document.documentElement && !o.closest(".navbar-nav").length && e(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(e(this)).on("click", n);
				var a = {
					relatedTarget: this
				};
				if (o.trigger(r = e.Event("show.bs.dropdown", a)), r.isDefaultPrevented()) return;
				i.trigger("focus").attr("aria-expanded", "true"), o.toggleClass("open").trigger(e.Event("shown.bs.dropdown", a))
			}
			return !1
		}
	}, s.prototype.keydown = function(n) {
		if (/(38|40|27|32)/.test(n.which) && !/input|textarea/i.test(n.target.tagName)) {
			var r = e(this);
			if (n.preventDefault(), n.stopPropagation(), !r.is(".disabled, :disabled")) {
				var i = t(r),
					s = i.hasClass("open");
				if (!s && 27 != n.which || s && 27 == n.which) return 27 == n.which && i.find(o).trigger("focus"), r.trigger("click");
				var a = " li:not(.disabled):visible a",
					u = i.find(".dropdown-menu" + a);
				if (u.length) {
					var l = u.index(n.target);
					38 == n.which && l > 0 && l--, 40 == n.which && l < u.length - 1 && l++, ~l || (l = 0), u.eq(l).trigger("focus")
				}
			}
		}
	};
	var a = e.fn.dropdown;
	e.fn.dropdown = r, e.fn.dropdown.Constructor = s, e.fn.dropdown.noConflict = function() {
		return e.fn.dropdown = a, this
	}, e(document).on("click.bs.dropdown.data-api", n).on("click.bs.dropdown.data-api", ".dropdown form", function(e) {
		e.stopPropagation()
	}).on("click.bs.dropdown.data-api", o, s.prototype.toggle).on("keydown.bs.dropdown.data-api", o, s.prototype.keydown).on("keydown.bs.dropdown.data-api", ".dropdown-menu", s.prototype.keydown)
}(jQuery), + function(e) {
	"use strict";

	function t(t, r) {
		return this.each(function() {
			var i = e(this),
				o = i.data("bs.modal"),
				s = e.extend({}, n.DEFAULTS, i.data(), "object" == typeof t && t);
			o || i.data("bs.modal", o = new n(this, s)), "string" == typeof t ? o[t](r) : s.show && o.show(r)
		})
	}
	var n = function(t, n) {
		this.options = n, this.$body = e(document.body), this.$element = e(t), this.$dialog = this.$element.find(".modal-dialog"), this.$backdrop = null, this.isShown = null, this.originalBodyPad = null, this.scrollbarWidth = 0, this.ignoreBackdropClick = !1, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, e.proxy(function() {
			this.$element.trigger("loaded.bs.modal")
		}, this))
	};
	n.VERSION = "3.3.7", n.TRANSITION_DURATION = 300, n.BACKDROP_TRANSITION_DURATION = 150, n.DEFAULTS = {
		backdrop: !0,
		keyboard: !0,
		show: !0
	}, n.prototype.toggle = function(e) {
		return this.isShown ? this.hide() : this.show(e)
	}, n.prototype.show = function(t) {
		var r = this,
			i = e.Event("show.bs.modal", {
				relatedTarget: t
			});
		this.$element.trigger(i), this.isShown || i.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.setScrollbar(), this.$body.addClass("modal-open"), this.escape(), this.resize(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', e.proxy(this.hide, this)), this.$dialog.on("mousedown.dismiss.bs.modal", function() {
			r.$element.one("mouseup.dismiss.bs.modal", function(t) {
				e(t.target).is(r.$element) && (r.ignoreBackdropClick = !0)
			})
		}), this.backdrop(function() {
			var i = e.support.transition && r.$element.hasClass("fade");
			r.$element.parent().length || r.$element.appendTo(r.$body), r.$element.show().scrollTop(0), r.adjustDialog(), i && r.$element[0].offsetWidth, r.$element.addClass("in"), r.enforceFocus();
			var o = e.Event("shown.bs.modal", {
				relatedTarget: t
			});
			i ? r.$dialog.one("bsTransitionEnd", function() {
				r.$element.trigger("focus").trigger(o)
			}).emulateTransitionEnd(n.TRANSITION_DURATION) : r.$element.trigger("focus").trigger(o)
		}))
	}, n.prototype.hide = function(t) {
		t && t.preventDefault(), t = e.Event("hide.bs.modal"), this.$element.trigger(t), this.isShown && !t.isDefaultPrevented() && (this.isShown = !1, this.escape(), this.resize(), e(document).off("focusin.bs.modal"), this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"), this.$dialog.off("mousedown.dismiss.bs.modal"), e.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", e.proxy(this.hideModal, this)).emulateTransitionEnd(n.TRANSITION_DURATION) : this.hideModal())
	}, n.prototype.enforceFocus = function() {
		e(document).off("focusin.bs.modal").on("focusin.bs.modal", e.proxy(function(e) {
			document === e.target || this.$element[0] === e.target || this.$element.has(e.target).length || this.$element.trigger("focus")
		}, this))
	}, n.prototype.escape = function() {
		this.isShown && this.options.keyboard ? this.$element.on("keydown.dismiss.bs.modal", e.proxy(function(e) {
			27 == e.which && this.hide()
		}, this)) : this.isShown || this.$element.off("keydown.dismiss.bs.modal")
	}, n.prototype.resize = function() {
		this.isShown ? e(window).on("resize.bs.modal", e.proxy(this.handleUpdate, this)) : e(window).off("resize.bs.modal")
	}, n.prototype.hideModal = function() {
		var e = this;
		this.$element.hide(), this.backdrop(function() {
			e.$body.removeClass("modal-open"), e.resetAdjustments(), e.resetScrollbar(), e.$element.trigger("hidden.bs.modal")
		})
	}, n.prototype.removeBackdrop = function() {
		this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
	}, n.prototype.backdrop = function(t) {
		var r = this,
			i = this.$element.hasClass("fade") ? "fade" : "";
		if (this.isShown && this.options.backdrop) {
			var o = e.support.transition && i;
			if (this.$backdrop = e(document.createElement("div")).addClass("modal-backdrop " + i).appendTo(this.$body), this.$element.on("click.dismiss.bs.modal", e.proxy(function(e) {
					return this.ignoreBackdropClick ? void(this.ignoreBackdropClick = !1) : void(e.target === e.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus() : this.hide()))
				}, this)), o && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !t) return;
			o ? this.$backdrop.one("bsTransitionEnd", t).emulateTransitionEnd(n.BACKDROP_TRANSITION_DURATION) : t()
		} else if (!this.isShown && this.$backdrop) {
			this.$backdrop.removeClass("in");
			var s = function() {
				r.removeBackdrop(), t && t()
			};
			e.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", s).emulateTransitionEnd(n.BACKDROP_TRANSITION_DURATION) : s()
		} else t && t()
	}, n.prototype.handleUpdate = function() {
		this.adjustDialog()
	}, n.prototype.adjustDialog = function() {
		var e = this.$element[0].scrollHeight > document.documentElement.clientHeight;
		this.$element.css({
			paddingLeft: !this.bodyIsOverflowing && e ? this.scrollbarWidth : "",
			paddingRight: this.bodyIsOverflowing && !e ? this.scrollbarWidth : ""
		})
	}, n.prototype.resetAdjustments = function() {
		this.$element.css({
			paddingLeft: "",
			paddingRight: ""
		})
	}, n.prototype.checkScrollbar = function() {
		var e = window.innerWidth;
		if (!e) {
			var t = document.documentElement.getBoundingClientRect();
			e = t.right - Math.abs(t.left)
		}
		this.bodyIsOverflowing = document.body.clientWidth < e, this.scrollbarWidth = this.measureScrollbar()
	}, n.prototype.setScrollbar = function() {
		var e = parseInt(this.$body.css("padding-right") || 0, 10);
		this.originalBodyPad = document.body.style.paddingRight || "", this.bodyIsOverflowing && this.$body.css("padding-right", e + this.scrollbarWidth)
	}, n.prototype.resetScrollbar = function() {
		this.$body.css("padding-right", this.originalBodyPad)
	}, n.prototype.measureScrollbar = function() {
		var e = document.createElement("div");
		e.className = "modal-scrollbar-measure", this.$body.append(e);
		var t = e.offsetWidth - e.clientWidth;
		return this.$body[0].removeChild(e), t
	};
	var r = e.fn.modal;
	e.fn.modal = t, e.fn.modal.Constructor = n, e.fn.modal.noConflict = function() {
		return e.fn.modal = r, this
	}, e(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(n) {
		var r = e(this),
			i = r.attr("href"),
			o = e(r.attr("data-target") || i && i.replace(/.*(?=#[^\s]+$)/, "")),
			s = o.data("bs.modal") ? "toggle" : e.extend({
				remote: !/#/.test(i) && i
			}, o.data(), r.data());
		r.is("a") && n.preventDefault(), o.one("show.bs.modal", function(e) {
			e.isDefaultPrevented() || o.one("hidden.bs.modal", function() {
				r.is(":visible") && r.trigger("focus")
			})
		}), t.call(o, s, this)
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.tooltip"),
				o = "object" == typeof t && t;
			!i && /destroy|hide/.test(t) || (i || r.data("bs.tooltip", i = new n(this, o)), "string" == typeof t && i[t]())
		})
	}
	var n = function(e, t) {
		this.type = null, this.options = null, this.enabled = null, this.timeout = null, this.hoverState = null, this.$element = null, this.inState = null, this.init("tooltip", e, t)
	};
	n.VERSION = "3.3.7", n.TRANSITION_DURATION = 150, n.DEFAULTS = {
		animation: !0,
		placement: "top",
		selector: !1,
		template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
		trigger: "hover focus",
		title: "",
		delay: 0,
		html: !1,
		container: !1,
		viewport: {
			selector: "body",
			padding: 0
		}
	}, n.prototype.init = function(t, n, r) {
		if (this.enabled = !0, this.type = t, this.$element = e(n), this.options = this.getOptions(r), this.$viewport = this.options.viewport && e(e.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport), this.inState = {
				click: !1,
				hover: !1,
				focus: !1
			}, this.$element[0] instanceof document.constructor && !this.options.selector) throw new Error("`selector` option must be specified when initializing " + this.type + " on the window.document object!");
		for (var i = this.options.trigger.split(" "), o = i.length; o--;) {
			var s = i[o];
			if ("click" == s) this.$element.on("click." + this.type, this.options.selector, e.proxy(this.toggle, this));
			else if ("manual" != s) {
				var a = "hover" == s ? "mouseenter" : "focusin",
					u = "hover" == s ? "mouseleave" : "focusout";
				this.$element.on(a + "." + this.type, this.options.selector, e.proxy(this.enter, this)), this.$element.on(u + "." + this.type, this.options.selector, e.proxy(this.leave, this))
			}
		}
		this.options.selector ? this._options = e.extend({}, this.options, {
			trigger: "manual",
			selector: ""
		}) : this.fixTitle()
	}, n.prototype.getDefaults = function() {
		return n.DEFAULTS
	}, n.prototype.getOptions = function(t) {
		return t = e.extend({}, this.getDefaults(), this.$element.data(), t), t.delay && "number" == typeof t.delay && (t.delay = {
			show: t.delay,
			hide: t.delay
		}), t
	}, n.prototype.getDelegateOptions = function() {
		var t = {},
			n = this.getDefaults();
		return this._options && e.each(this._options, function(e, r) {
			n[e] != r && (t[e] = r)
		}), t
	}, n.prototype.enter = function(t) {
		var n = t instanceof this.constructor ? t : e(t.currentTarget).data("bs." + this.type);
		return n || (n = new this.constructor(t.currentTarget, this.getDelegateOptions()), e(t.currentTarget).data("bs." + this.type, n)), t instanceof e.Event && (n.inState["focusin" == t.type ? "focus" : "hover"] = !0), n.tip().hasClass("in") || "in" == n.hoverState ? void(n.hoverState = "in") : (clearTimeout(n.timeout), n.hoverState = "in", n.options.delay && n.options.delay.show ? void(n.timeout = setTimeout(function() {
			"in" == n.hoverState && n.show()
		}, n.options.delay.show)) : n.show())
	}, n.prototype.isInStateTrue = function() {
		for (var e in this.inState)
			if (this.inState[e]) return !0;
		return !1
	}, n.prototype.leave = function(t) {
		var n = t instanceof this.constructor ? t : e(t.currentTarget).data("bs." + this.type);
		if (n || (n = new this.constructor(t.currentTarget, this.getDelegateOptions()), e(t.currentTarget).data("bs." + this.type, n)), t instanceof e.Event && (n.inState["focusout" == t.type ? "focus" : "hover"] = !1), !n.isInStateTrue()) return clearTimeout(n.timeout), n.hoverState = "out", n.options.delay && n.options.delay.hide ? void(n.timeout = setTimeout(function() {
			"out" == n.hoverState && n.hide()
		}, n.options.delay.hide)) : n.hide()
	}, n.prototype.show = function() {
		var t = e.Event("show.bs." + this.type);
		if (this.hasContent() && this.enabled) {
			this.$element.trigger(t);
			var r = e.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
			if (t.isDefaultPrevented() || !r) return;
			var i = this,
				o = this.tip(),
				s = this.getUID(this.type);
			this.setContent(), o.attr("id", s), this.$element.attr("aria-describedby", s), this.options.animation && o.addClass("fade");
			var a = "function" == typeof this.options.placement ? this.options.placement.call(this, o[0], this.$element[0]) : this.options.placement,
				u = /\s?auto?\s?/i,
				l = u.test(a);
			l && (a = a.replace(u, "") || "top"), o.detach().css({
					top: 0,
					left: 0,
					display: "block"
				}).addClass(a).data("bs." + this.type, this), this.options.container ? o.appendTo(this.options.container) : o.insertAfter(this.$element),
				this.$element.trigger("inserted.bs." + this.type);
			var c = this.getPosition(),
				p = o[0].offsetWidth,
				f = o[0].offsetHeight;
			if (l) {
				var h = a,
					d = this.getPosition(this.$viewport);
				a = "bottom" == a && c.bottom + f > d.bottom ? "top" : "top" == a && c.top - f < d.top ? "bottom" : "right" == a && c.right + p > d.width ? "left" : "left" == a && c.left - p < d.left ? "right" : a, o.removeClass(h).addClass(a)
			}
			var g = this.getCalculatedOffset(a, c, p, f);
			this.applyPlacement(g, a);
			var v = function() {
				var e = i.hoverState;
				i.$element.trigger("shown.bs." + i.type), i.hoverState = null, "out" == e && i.leave(i)
			};
			e.support.transition && this.$tip.hasClass("fade") ? o.one("bsTransitionEnd", v).emulateTransitionEnd(n.TRANSITION_DURATION) : v()
		}
	}, n.prototype.applyPlacement = function(t, n) {
		var r = this.tip(),
			i = r[0].offsetWidth,
			o = r[0].offsetHeight,
			s = parseInt(r.css("margin-top"), 10),
			a = parseInt(r.css("margin-left"), 10);
		isNaN(s) && (s = 0), isNaN(a) && (a = 0), t.top += s, t.left += a, e.offset.setOffset(r[0], e.extend({
			using: function(e) {
				r.css({
					top: Math.round(e.top),
					left: Math.round(e.left)
				})
			}
		}, t), 0), r.addClass("in");
		var u = r[0].offsetWidth,
			l = r[0].offsetHeight;
		"top" == n && l != o && (t.top = t.top + o - l);
		var c = this.getViewportAdjustedDelta(n, t, u, l);
		c.left ? t.left += c.left : t.top += c.top;
		var p = /top|bottom/.test(n),
			f = p ? 2 * c.left - i + u : 2 * c.top - o + l,
			h = p ? "offsetWidth" : "offsetHeight";
		r.offset(t), this.replaceArrow(f, r[0][h], p)
	}, n.prototype.replaceArrow = function(e, t, n) {
		this.arrow().css(n ? "left" : "top", 50 * (1 - e / t) + "%").css(n ? "top" : "left", "")
	}, n.prototype.setContent = function() {
		var e = this.tip(),
			t = this.getTitle();
		e.find(".tooltip-inner")[this.options.html ? "html" : "text"](t), e.removeClass("fade in top bottom left right")
	}, n.prototype.hide = function(t) {
		function r() {
			"in" != i.hoverState && o.detach(), i.$element && i.$element.removeAttr("aria-describedby").trigger("hidden.bs." + i.type), t && t()
		}
		var i = this,
			o = e(this.$tip),
			s = e.Event("hide.bs." + this.type);
		if (this.$element.trigger(s), !s.isDefaultPrevented()) return o.removeClass("in"), e.support.transition && o.hasClass("fade") ? o.one("bsTransitionEnd", r).emulateTransitionEnd(n.TRANSITION_DURATION) : r(), this.hoverState = null, this
	}, n.prototype.fixTitle = function() {
		var e = this.$element;
		(e.attr("title") || "string" != typeof e.attr("data-original-title")) && e.attr("data-original-title", e.attr("title") || "").attr("title", "")
	}, n.prototype.hasContent = function() {
		return this.getTitle()
	}, n.prototype.getPosition = function(t) {
		t = t || this.$element;
		var n = t[0],
			r = "BODY" == n.tagName,
			i = n.getBoundingClientRect();
		null == i.width && (i = e.extend({}, i, {
			width: i.right - i.left,
			height: i.bottom - i.top
		}));
		var o = window.SVGElement && n instanceof window.SVGElement,
			s = r ? {
				top: 0,
				left: 0
			} : o ? null : t.offset(),
			a = {
				scroll: r ? document.documentElement.scrollTop || document.body.scrollTop : t.scrollTop()
			},
			u = r ? {
				width: e(window).width(),
				height: e(window).height()
			} : null;
		return e.extend({}, i, a, u, s)
	}, n.prototype.getCalculatedOffset = function(e, t, n, r) {
		return "bottom" == e ? {
			top: t.top + t.height,
			left: t.left + t.width / 2 - n / 2
		} : "top" == e ? {
			top: t.top - r,
			left: t.left + t.width / 2 - n / 2
		} : "left" == e ? {
			top: t.top + t.height / 2 - r / 2,
			left: t.left - n
		} : {
			top: t.top + t.height / 2 - r / 2,
			left: t.left + t.width
		}
	}, n.prototype.getViewportAdjustedDelta = function(e, t, n, r) {
		var i = {
			top: 0,
			left: 0
		};
		if (!this.$viewport) return i;
		var o = this.options.viewport && this.options.viewport.padding || 0,
			s = this.getPosition(this.$viewport);
		if (/right|left/.test(e)) {
			var a = t.top - o - s.scroll,
				u = t.top + o - s.scroll + r;
			a < s.top ? i.top = s.top - a : u > s.top + s.height && (i.top = s.top + s.height - u)
		} else {
			var l = t.left - o,
				c = t.left + o + n;
			l < s.left ? i.left = s.left - l : c > s.right && (i.left = s.left + s.width - c)
		}
		return i
	}, n.prototype.getTitle = function() {
		var e, t = this.$element,
			n = this.options;
		return e = t.attr("data-original-title") || ("function" == typeof n.title ? n.title.call(t[0]) : n.title)
	}, n.prototype.getUID = function(e) {
		do e += ~~(1e6 * Math.random()); while (document.getElementById(e));
		return e
	}, n.prototype.tip = function() {
		if (!this.$tip && (this.$tip = e(this.options.template), 1 != this.$tip.length)) throw new Error(this.type + " `template` option must consist of exactly 1 top-level element!");
		return this.$tip
	}, n.prototype.arrow = function() {
		return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
	}, n.prototype.enable = function() {
		this.enabled = !0
	}, n.prototype.disable = function() {
		this.enabled = !1
	}, n.prototype.toggleEnabled = function() {
		this.enabled = !this.enabled
	}, n.prototype.toggle = function(t) {
		var n = this;
		t && (n = e(t.currentTarget).data("bs." + this.type), n || (n = new this.constructor(t.currentTarget, this.getDelegateOptions()), e(t.currentTarget).data("bs." + this.type, n))), t ? (n.inState.click = !n.inState.click, n.isInStateTrue() ? n.enter(n) : n.leave(n)) : n.tip().hasClass("in") ? n.leave(n) : n.enter(n)
	}, n.prototype.destroy = function() {
		var e = this;
		clearTimeout(this.timeout), this.hide(function() {
			e.$element.off("." + e.type).removeData("bs." + e.type), e.$tip && e.$tip.detach(), e.$tip = null, e.$arrow = null, e.$viewport = null, e.$element = null
		})
	};
	var r = e.fn.tooltip;
	e.fn.tooltip = t, e.fn.tooltip.Constructor = n, e.fn.tooltip.noConflict = function() {
		return e.fn.tooltip = r, this
	}
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.popover"),
				o = "object" == typeof t && t;
			!i && /destroy|hide/.test(t) || (i || r.data("bs.popover", i = new n(this, o)), "string" == typeof t && i[t]())
		})
	}
	var n = function(e, t) {
		this.init("popover", e, t)
	};
	if (!e.fn.tooltip) throw new Error("Popover requires tooltip.js");
	n.VERSION = "3.3.7", n.DEFAULTS = e.extend({}, e.fn.tooltip.Constructor.DEFAULTS, {
		placement: "right",
		trigger: "click",
		content: "",
		template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
	}), n.prototype = e.extend({}, e.fn.tooltip.Constructor.prototype), n.prototype.constructor = n, n.prototype.getDefaults = function() {
		return n.DEFAULTS
	}, n.prototype.setContent = function() {
		var e = this.tip(),
			t = this.getTitle(),
			n = this.getContent();
		e.find(".popover-title")[this.options.html ? "html" : "text"](t), e.find(".popover-content").children().detach().end()[this.options.html ? "string" == typeof n ? "html" : "append" : "text"](n), e.removeClass("fade top bottom left right in"), e.find(".popover-title").html() || e.find(".popover-title").hide()
	}, n.prototype.hasContent = function() {
		return this.getTitle() || this.getContent()
	}, n.prototype.getContent = function() {
		var e = this.$element,
			t = this.options;
		return e.attr("data-content") || ("function" == typeof t.content ? t.content.call(e[0]) : t.content)
	}, n.prototype.arrow = function() {
		return this.$arrow = this.$arrow || this.tip().find(".arrow")
	};
	var r = e.fn.popover;
	e.fn.popover = t, e.fn.popover.Constructor = n, e.fn.popover.noConflict = function() {
		return e.fn.popover = r, this
	}
}(jQuery), + function(e) {
	"use strict";

	function t(n, r) {
		this.$body = e(document.body), this.$scrollElement = e(e(n).is(document.body) ? window : n), this.options = e.extend({}, t.DEFAULTS, r), this.selector = (this.options.target || "") + " .nav li > a", this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, this.$scrollElement.on("scroll.bs.scrollspy", e.proxy(this.process, this)), this.refresh(), this.process()
	}

	function n(n) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.scrollspy"),
				o = "object" == typeof n && n;
			i || r.data("bs.scrollspy", i = new t(this, o)), "string" == typeof n && i[n]()
		})
	}
	t.VERSION = "3.3.7", t.DEFAULTS = {
		offset: 10
	}, t.prototype.getScrollHeight = function() {
		return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
	}, t.prototype.refresh = function() {
		var t = this,
			n = "offset",
			r = 0;
		this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight(), e.isWindow(this.$scrollElement[0]) || (n = "position", r = this.$scrollElement.scrollTop()), this.$body.find(this.selector).map(function() {
			var t = e(this),
				i = t.data("target") || t.attr("href"),
				o = /^#./.test(i) && e(i);
			return o && o.length && o.is(":visible") && [
				[o[n]().top + r, i]
			] || null
		}).sort(function(e, t) {
			return e[0] - t[0]
		}).each(function() {
			t.offsets.push(this[0]), t.targets.push(this[1])
		})
	}, t.prototype.process = function() {
		var e, t = this.$scrollElement.scrollTop() + this.options.offset,
			n = this.getScrollHeight(),
			r = this.options.offset + n - this.$scrollElement.height(),
			i = this.offsets,
			o = this.targets,
			s = this.activeTarget;
		if (this.scrollHeight != n && this.refresh(), t >= r) return s != (e = o[o.length - 1]) && this.activate(e);
		if (s && t < i[0]) return this.activeTarget = null, this.clear();
		for (e = i.length; e--;) s != o[e] && t >= i[e] && (void 0 === i[e + 1] || t < i[e + 1]) && this.activate(o[e])
	}, t.prototype.activate = function(t) {
		this.activeTarget = t, this.clear();
		var n = this.selector + '[data-target="' + t + '"],' + this.selector + '[href="' + t + '"]',
			r = e(n).parents("li").addClass("active");
		r.parent(".dropdown-menu").length && (r = r.closest("li.dropdown").addClass("active")), r.trigger("activate.bs.scrollspy")
	}, t.prototype.clear = function() {
		e(this.selector).parentsUntil(this.options.target, ".active").removeClass("active")
	};
	var r = e.fn.scrollspy;
	e.fn.scrollspy = n, e.fn.scrollspy.Constructor = t, e.fn.scrollspy.noConflict = function() {
		return e.fn.scrollspy = r, this
	}, e(window).on("load.bs.scrollspy.data-api", function() {
		e('[data-spy="scroll"]').each(function() {
			var t = e(this);
			n.call(t, t.data())
		})
	})
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.tab");
			i || r.data("bs.tab", i = new n(this)), "string" == typeof t && i[t]()
		})
	}
	var n = function(t) {
		this.element = e(t)
	};
	n.VERSION = "3.3.7", n.TRANSITION_DURATION = 150, n.prototype.show = function() {
		var t = this.element,
			n = t.closest("ul:not(.dropdown-menu)"),
			r = t.data("target");
		if (r || (r = t.attr("href"), r = r && r.replace(/.*(?=#[^\s]*$)/, "")), !t.parent("li").hasClass("active")) {
			var i = n.find(".active:last a"),
				o = e.Event("hide.bs.tab", {
					relatedTarget: t[0]
				}),
				s = e.Event("show.bs.tab", {
					relatedTarget: i[0]
				});
			if (i.trigger(o), t.trigger(s), !s.isDefaultPrevented() && !o.isDefaultPrevented()) {
				var a = e(r);
				this.activate(t.closest("li"), n), this.activate(a, a.parent(), function() {
					i.trigger({
						type: "hidden.bs.tab",
						relatedTarget: t[0]
					}), t.trigger({
						type: "shown.bs.tab",
						relatedTarget: i[0]
					})
				})
			}
		}
	}, n.prototype.activate = function(t, r, i) {
		function o() {
			s.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !1), t.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded", !0), a ? (t[0].offsetWidth, t.addClass("in")) : t.removeClass("fade"), t.parent(".dropdown-menu").length && t.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !0), i && i()
		}
		var s = r.find("> .active"),
			a = i && e.support.transition && (s.length && s.hasClass("fade") || !!r.find("> .fade").length);
		s.length && a ? s.one("bsTransitionEnd", o).emulateTransitionEnd(n.TRANSITION_DURATION) : o(), s.removeClass("in")
	};
	var r = e.fn.tab;
	e.fn.tab = t, e.fn.tab.Constructor = n, e.fn.tab.noConflict = function() {
		return e.fn.tab = r, this
	};
	var i = function(n) {
		n.preventDefault(), t.call(e(this), "show")
	};
	e(document).on("click.bs.tab.data-api", '[data-toggle="tab"]', i).on("click.bs.tab.data-api", '[data-toggle="pill"]', i)
}(jQuery), + function(e) {
	"use strict";

	function t(t) {
		return this.each(function() {
			var r = e(this),
				i = r.data("bs.affix"),
				o = "object" == typeof t && t;
			i || r.data("bs.affix", i = new n(this, o)), "string" == typeof t && i[t]()
		})
	}
	var n = function(t, r) {
		this.options = e.extend({}, n.DEFAULTS, r), this.$target = e(this.options.target).on("scroll.bs.affix.data-api", e.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", e.proxy(this.checkPositionWithEventLoop, this)), this.$element = e(t), this.affixed = null, this.unpin = null, this.pinnedOffset = null, this.checkPosition()
	};
	n.VERSION = "3.3.7", n.RESET = "affix affix-top affix-bottom", n.DEFAULTS = {
		offset: 0,
		target: window
	}, n.prototype.getState = function(e, t, n, r) {
		var i = this.$target.scrollTop(),
			o = this.$element.offset(),
			s = this.$target.height();
		if (null != n && "top" == this.affixed) return i < n && "top";
		if ("bottom" == this.affixed) return null != n ? !(i + this.unpin <= o.top) && "bottom" : !(i + s <= e - r) && "bottom";
		var a = null == this.affixed,
			u = a ? i : o.top,
			l = a ? s : t;
		return null != n && i <= n ? "top" : null != r && u + l >= e - r && "bottom"
	}, n.prototype.getPinnedOffset = function() {
		if (this.pinnedOffset) return this.pinnedOffset;
		this.$element.removeClass(n.RESET).addClass("affix");
		var e = this.$target.scrollTop(),
			t = this.$element.offset();
		return this.pinnedOffset = t.top - e
	}, n.prototype.checkPositionWithEventLoop = function() {
		setTimeout(e.proxy(this.checkPosition, this), 1)
	}, n.prototype.checkPosition = function() {
		if (this.$element.is(":visible")) {
			var t = this.$element.height(),
				r = this.options.offset,
				i = r.top,
				o = r.bottom,
				s = Math.max(e(document).height(), e(document.body).height());
			"object" != typeof r && (o = i = r), "function" == typeof i && (i = r.top(this.$element)), "function" == typeof o && (o = r.bottom(this.$element));
			var a = this.getState(s, t, i, o);
			if (this.affixed != a) {
				null != this.unpin && this.$element.css("top", "");
				var u = "affix" + (a ? "-" + a : ""),
					l = e.Event(u + ".bs.affix");
				if (this.$element.trigger(l), l.isDefaultPrevented()) return;
				this.affixed = a, this.unpin = "bottom" == a ? this.getPinnedOffset() : null, this.$element.removeClass(n.RESET).addClass(u).trigger(u.replace("affix", "affixed") + ".bs.affix")
			}
			"bottom" == a && this.$element.offset({
				top: s - t - o
			})
		}
	};
	var r = e.fn.affix;
	e.fn.affix = t, e.fn.affix.Constructor = n, e.fn.affix.noConflict = function() {
		return e.fn.affix = r, this
	}, e(window).on("load", function() {
		e('[data-spy="affix"]').each(function() {
			var n = e(this),
				r = n.data();
			r.offset = r.offset || {}, null != r.offsetBottom && (r.offset.bottom = r.offsetBottom), null != r.offsetTop && (r.offset.top = r.offsetTop), t.call(n, r)
		})
	})
}(jQuery), define("bootstrap", function() {}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("views/examples", ["exports", "backbone.marionette", "./example", "bootstrap"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("./example"), require("bootstrap"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.example, e.bootstrap), e.examples = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var i = r(t),
			o = r(n),
			s = i.default.CollectionView.extend({
				childView: o.default
			});
		e.default = s
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("views/sendBoxLayout", ["exports", "backbone", "backbone.marionette", "templates/sendBoxLayout.twig", "./sendBox", "./examples"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone"), require("backbone.marionette"), require("templates/sendBoxLayout.twig"), require("./sendBox"), require("./examples"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.backbone, e.sendBoxLayout, e.sendBox, e.examples), e.sendBoxLayout = n.exports
		}
	}(this, function(e, t, n, r, i, o) {
		"use strict";

		function s(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var a = s(t),
			u = s(n),
			l = s(i),
			c = s(o),
			p = u.default.View.extend({
				template: r.render,
				regions: {
					sendBox: ".sendBox",
					examples: ".examples"
				},
				onAttach: function() {
					var e = new l.default({
						model: this.model
					});
					this.showChildView("sendBox", e);
					var t = new a.default.Collection(this.options.examples),
						n = new c.default({
							collection: t
						});
					this.showChildView("examples", n)
				}
			});
		e.default = p
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("models/route", ["exports", "backbone"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone), e.route = n.exports
		}
	}(this, function(e, t) {
		"use strict";

		function n(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var r = n(t),
			i = r.default.Model.extend({
				initialize: function() {
					this.set("url", ("" + this.get("prefix") + this.get("path")).replace(/\/\//, "/"))
				}
			});
		e.default = i
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("collections/routes", ["exports", "backbone", "../models/route"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone"), require("../models/route"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.route), e.routes = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var i = r(t),
			o = r(n),
			s = i.default.Collection.extend({
				model: o.default
			});
		e.default = new s(routes)
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("routes/SendBox", ["exports", "lodash", "backbone", "../views/layout", "../helpers/examples", "../views/sendBoxLayout", "../collections/routes"], t);
		else if ("undefined" != typeof exports) t(exports, require("lodash"), require("backbone"), require("../views/layout"), require("../helpers/examples"), require("../views/sendBoxLayout"), require("../collections/routes"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.lodash, e.backbone, e.layout, e.examples, e.sendBoxLayout, e.routes), e.SendBox = n.exports
		}
	}(this, function(e, t, n, r, i, o, s) {
		"use strict";

		function a(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var u = a(t),
			l = a(n),
			c = a(r),
			p = a(i),
			f = a(o),
			h = a(s),
			d = l.default.Router.extend({
				routes: {
					"sendBox/:id": "showSendBoxAction"
				},
				showSendBoxAction: function(e) {
					var t = h.default.findWhere({
							id: e
						}),
						n = t.get("examplesPresent") ? u.default.find(p.default, function(t) {
							return t.routeId === e
						}) : null,
						r = n ? n.rows : [],
						i = new f.default({
							examples: r,
							model: t
						});
					c.default.showChildView("content", i)
				}
			});
		e.default = d
	}), define("templates/routesLayout.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "routesLayout.twig",
				allowInlineIncludes: !0,
				data: [{
					type: "raw",
					value: '<div class="listing">\n\n</div>'
				}],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), define("templates/routesList.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "routesList.twig",
				allowInlineIncludes: !0,
				data: [{
					type: "raw",
					value: '<div class="header"><div class="panel panel-default text-center"><h2>'+maintitle+'</h2></div></div><label>Filter by url path</label><input title="filer" class="form-control dt-filter"/>\n<table class="table table-hover">\n<tr>\n<td>\nmethod</td><td>permissions</td><td>url</td><td>description</td><td>action</td></tr><tbody class="dt-routes-container"></tbody></table>'
				}],
				precompiled: !0
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}), define("templates/routesItem.twig", ["exports", "twig"], function(e, t) {
		var n, r = t.twig,
			i = {
				id: "routesItem.twig",
				allowInlineIncludes: !0,
				data: [
				 {
					type: "raw",
					value: "<td>\n    "
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.for",
						key_var: null,
						value_var: "method",
						expression: [{
							type: "Twig.expression.type.variable",
							value: "methods",
							match: ["methods"]
						}],
						output: [{
							type: "raw",
							value: "        "
						}, {
							type: "output",
							stack: [{
								type: "Twig.expression.type.variable",
								value: "method",
								match: ["method"]
							}]
						}, {
							type: "raw",
							value: "\n    "
						}]
					}
				}, {
					type: "raw",
					value: "</td>\n<td>\n    "
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "permissions",
						match: ["permissions"]
					}]
				}, {
					type: "raw",
					value: "</td>\n<td>\n    "
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "url",
						match: ["url"]
					}]
				},{
					type: "raw",
					value: "</td><td>\n    "
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "description",
						match: ["description"]
					}]
				}, {
					type: "raw",
					value: '\n</td>\n<td>\n    <a href="#sendBox/'
				}, {
					type: "output",
					stack: [{
						type: "Twig.expression.type.variable",
						value: "model",
						match: ["model"]
					}, {
						type: "Twig.expression.type.key.period",
						key: "id"
					}]
				}, {
					type: "logic",
					token: {
						type: "Twig.logic.type.for",
						key_var: null,
						value_var: "method",
						expression: [{
							type: "Twig.expression.type.variable",
							value: "methods",
							match: ["methods"]
						}],
						output: [{
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "method",
									match: ["method"]
								}, {
									type: "Twig.expression.type.string",
									value: "POST"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [{
									type: "raw",
									value: '">\n        <button class="btn">Explore</button>\n    </a>\n</td>'
								}]
							},
						}, {
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "method",
									match: ["method"]
								}, {
									type: "Twig.expression.type.string",
									value: "GET"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "==",
									precidence: 9,
									associativity: "leftToRight",
									operator: "=="
								}],
								output: [
									{
									type: "raw",
									value: '">\n        <button class="btn">Explore</button>\n    </a>\n</td>'
									}
								]
							}
						}, {
							type: "logic",
							token: {
								type: "Twig.logic.type.if",
								stack: [{
									type: "Twig.expression.type.variable",
									value: "method",
									match: ["method"]
								}, {
									type: "Twig.expression.type.string",
									value: "POST"
								}, {
									type: "Twig.expression.type.operator.binary",
									value: "!=",
									precidence: 9,
									associativity: "leftToRight",
									operator: "!="
								}],
								output: [{
									type: "raw",
									value: '"></td>'
								}]
							}
						}]
					}
				}]
			};
		n = r(i), Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = n, e.render = n.render.bind(n), e.autoGeneratedData = i
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("views/routeItem", ["exports", "backbone.marionette", "templates/routesItem.twig", "lodash"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("templates/routesItem.twig"), require("lodash"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.routesItem, e.lodash), e.routeItem = n.exports
		}
	}(this, function(e, t, n, r) {
		"use strict";

		function i(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var o = i(t),
			s = i(r),
			a = o.default.View.extend({
				template: n.render,
				tagName: "tr",
				serializeData: function() { // FOR LIST PAGES
					return {
						url: this.model.get("url"),
						description: this.model.get("description"),
						examplesPresent: this.model.get("examplesPresent"),
						model: this.model,
						returntype: this.model.get("returntype"),
						permissions: s.default.map(this.model.get("permissions")),
						methods: s.default.map(this.model.get("methods"), function(e, t) {
							return s.default.upperCase(t)
						})
					}
				}
			});
		e.default = a
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("views/routesList", ["exports", "templates/routesList.twig", "lodash", "backbone.marionette", "./routeItem", "../collections/routes"], t);
		else if ("undefined" != typeof exports) t(exports, require("templates/routesList.twig"), require("lodash"), require("backbone.marionette"), require("./routeItem"), require("../collections/routes"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.routesList, e.lodash, e.backbone, e.routeItem, e.routes), e.routesList = n.exports
		}
	}(this, function(e, t, n, r, i, o) {
		"use strict";

		function s(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var a = s(n),
			u = s(r),
			l = s(i),
			c = s(o),
			p = u.default.CompositeView.extend({
				template: t.render,
				childView: l.default,
				childViewContainer: ".dt-routes-container",
				ui: {
					filter: ".dt-filter"
				},
				events: {
					"keyup @ui.filter": "filterRoutes"
				},
				filterRoutes: function(e) {
					var t = this;
					this.collection.reset(c.default.filter(function(n) {
						return a.default.includes(a.default.lowerCase(n.get("url")), a.default.lowerCase(t.$(e.currentTarget).val()))
					}))
				}
			});
		e.default = p
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("views/routesLayout", ["exports", "backbone.marionette", "templates/routesLayout.twig", "./routesList"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone.marionette"), require("templates/routesLayout.twig"), require("./routesList"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.routesLayout, e.routesList), e.routesLayout = n.exports
		}
	}(this, function(e, t, n, r) {
		"use strict";

		function i(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var o = i(t),
			s = i(r),
			a = o.default.View.extend({
				template: n.render,
				onAttach: function() {
					var e = new s.default({
						collection: this.options.collection
					});
					this.showChildView("listing", e)
				},
				regions: {
					listing: ".listing"
				}
			});
		e.default = a
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("routes/Index", ["exports", "backbone", "../collections/routes", "../views/layout", "../views/routesLayout"], t);
		else if ("undefined" != typeof exports) t(exports, require("backbone"), require("../collections/routes"), require("../views/layout"), require("../views/routesLayout"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.backbone, e.routes, e.layout, e.routesLayout), e.Index = n.exports
		}
	}(this, function(e, t, n, r, i) {
		"use strict";

		function o(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		});
		var s = o(t),
			a = o(n),
			u = o(r),
			l = o(i),
			c = s.default.Router.extend({
				routes: {
					"": "showRoutesAction"
				},
				showRoutesAction: function() {
					var e = new l.default({
						collection: a.default.clone()
					});
					u.default.showChildView("content", e)
				}
			});
		e.default = c
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("helpers/initRoutes", ["exports", "../routes/SendBox", "../routes/Index"], t);
		else if ("undefined" != typeof exports) t(exports, require("../routes/SendBox"), require("../routes/Index"));
		else {
			var n = {
				exports: {}
			};
			t(n.exports, e.SendBox, e.Index), e.initRoutes = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		Object.defineProperty(e, "__esModule", {
			value: !0
		}), e.default = function() {
			return {
				sendBox: new i.default,
				index: new o.default
			}
		};
		var i = r(t),
			o = r(n)
	}),
	function(e, t) {
		if ("function" == typeof define && define.amd) define("index", ["backbone", "./views/layout", "./helpers/initRoutes", "bootstrap"], t);
		else if ("undefined" != typeof exports) t(require("backbone"), require("./views/layout"), require("./helpers/initRoutes"), require("bootstrap"));
		else {
			var n = {
				exports: {}
			};
			t(e.backbone, e.layout, e.initRoutes, e.bootstrap), e.index = n.exports
		}
	}(this, function(e, t, n) {
		"use strict";

		function r(e) {
			return e && e.__esModule ? e : {
				default: e
			}
		}
		var i = r(e),
			o = r(t),
			s = r(n);
		o.default.render(), (0, s.default)(), i.default.history.start()
	}), require(["index"], function() {}), define("enrtyPoint", function() {});
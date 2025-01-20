// Fonctions d'analyse TikTok
class TikTokAnalyzer {
    constructor() {
        this.engagementThresholds = {
            high: 0.15,    // 15% et plus
            medium: 0.08,  // 8-15%
            low: 0.03      // moins de 3%
        };
    }

    // Calcul du taux d'engagement
    calculateEngagementRate(video) {
        const { likes, comments, shares, views } = video.stats;
        const engagementActions = likes + comments + shares;
        return views > 0 ? (engagementActions / views) : 0;
    }

    // Analyse de la durée de vidéo optimale
    analyzeDuration(videos) {
        // Grouper les vidéos par durée
        const durationGroups = {};
        videos.forEach(video => {
            const duration = Math.floor(video.duration);
            if (!durationGroups[duration]) {
                durationGroups[duration] = {
                    count: 0,
                    totalEngagement: 0,
                    videos: []
                };
            }
            const engagement = this.calculateEngagementRate(video);
            durationGroups[duration].count++;
            durationGroups[duration].totalEngagement += engagement;
            durationGroups[duration].videos.push(video);
        });

        // Trouver la durée optimale
        let bestDuration = {
            duration: 0,
            avgEngagement: 0
        };

        Object.entries(durationGroups).forEach(([duration, data]) => {
            const avgEngagement = data.totalEngagement / data.count;
            if (avgEngagement > bestDuration.avgEngagement) {
                bestDuration = {
                    duration: parseInt(duration),
                    avgEngagement,
                    sampleSize: data.count
                };
            }
        });

        return bestDuration;
    }

    // Analyse des meilleurs moments de publication
    analyzePostingTimes(videos) {
        const timeSlots = {};
        
        videos.forEach(video => {
            const postTime = new Date(video.createTime);
            const hour = postTime.getHours();
            const dayOfWeek = postTime.getDay();
            
            const timeSlotKey = `${dayOfWeek}-${hour}`;
            
            if (!timeSlots[timeSlotKey]) {
                timeSlots[timeSlotKey] = {
                    count: 0,
                    totalEngagement: 0,
                    day: dayOfWeek,
                    hour: hour
                };
            }
            
            const engagement = this.calculateEngagementRate(video);
            timeSlots[timeSlotKey].count++;
            timeSlots[timeSlotKey].totalEngagement += engagement;
        });

        // Trouver les meilleurs créneaux
        return Object.entries(timeSlots)
            .map(([key, data]) => ({
                ...data,
                avgEngagement: data.totalEngagement / data.count
            }))
            .sort((a, b) => b.avgEngagement - a.avgEngagement)
            .slice(0, 5);
    }

    // Analyse des hashtags performants
    analyzeHashtags(videos) {
        const hashtagStats = {};
        
        videos.forEach(video => {
            video.hashtags.forEach(tag => {
                if (!hashtagStats[tag]) {
                    hashtagStats[tag] = {
                        count: 0,
                        totalEngagement: 0,
                        totalViews: 0,
                        videos: []
                    };
                }
                
                const engagement = this.calculateEngagementRate(video);
                hashtagStats[tag].count++;
                hashtagStats[tag].totalEngagement += engagement;
                hashtagStats[tag].totalViews += video.stats.views;
                hashtagStats[tag].videos.push(video.id);
            });
        });

        // Calculer les performances moyennes
        return Object.entries(hashtagStats)
            .map(([tag, stats]) => ({
                tag,
                avgEngagement: stats.totalEngagement / stats.count,
                totalViews: stats.totalViews,
                useCount: stats.count,
                performanceScore: (stats.totalEngagement / stats.count) * Math.log10(stats.totalViews)
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // Analyse des musiques performantes
    analyzeMusic(videos) {
        const musicStats = {};
        
        videos.forEach(video => {
            const { music } = video;
            if (!musicStats[music]) {
                musicStats[music] = {
                    count: 0,
                    totalEngagement: 0,
                    totalViews: 0,
                    videos: []
                };
            }
            
            const engagement = this.calculateEngagementRate(video);
            musicStats[music].count++;
            musicStats[music].totalEngagement += engagement;
            musicStats[music].totalViews += video.stats.views;
            musicStats[music].videos.push(video.id);
        });

        return Object.entries(musicStats)
            .map(([music, stats]) => ({
                music,
                avgEngagement: stats.totalEngagement / stats.count,
                totalViews: stats.totalViews,
                useCount: stats.count,
                performanceScore: (stats.totalEngagement / stats.count) * Math.log10(stats.totalViews)
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // Générer des recommandations
    generateRecommendations(analysisResults) {
        const recommendations = {
            timing: {
                bestTimes: analysisResults.bestPostingTimes.slice(0, 3),
                recommendation: `Postez vos vidéos ${this.formatTimeRecommendation(analysisResults.bestPostingTimes[0])}`
            },
            duration: {
                optimal: analysisResults.optimalDuration,
                recommendation: `Visez une durée de ${analysisResults.optimalDuration.duration} secondes pour un engagement optimal`
            },
            hashtags: {
                recommended: analysisResults.topHashtags.slice(0, 5),
                recommendation: "Utilisez une combinaison de ces hashtags performants"
            },
            music: {
                trending: analysisResults.topMusic.slice(0, 3),
                recommendation: "Ces musiques ont généré le plus d'engagement"
            }
        };

        return recommendations;
    }

    // Formatter les recommandations de temps
    formatTimeRecommendation(timeSlot) {
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return `${days[timeSlot.day]} à ${timeSlot.hour}h00`;
    }

    // Analyser un ensemble complet de vidéos
    async analyzeVideoBatch(videos) {
        const analysisResults = {
            optimalDuration: this.analyzeDuration(videos),
            bestPostingTimes: this.analyzePostingTimes(videos),
            topHashtags: this.analyzeHashtags(videos),
            topMusic: this.analyzeMusic(videos)
        };

        const recommendations = this.generateRecommendations(analysisResults);

        return {
            analysisResults,
            recommendations
        };
    }
}

export default TikTokAnalyzer;
